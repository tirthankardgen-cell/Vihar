import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdmin } from "../firebase/admin";
import { creditedMilliseconds, digest, gameOrigin, IdError, progressData, requireString, secret } from "./protocol";

type Input = Record<string, unknown>;
type Grant = { uid: string; gameId: string; origin: string; mode: "identity" | "activity"; version: number; expiresAt: Timestamp };
const lifetime = 12 * 60 * 60 * 1000;
const expires = (ms: number) => Timestamp.fromMillis(Date.now() + ms);
function bearer(request: Request) {
  const value = request.headers.get("authorization");
  if (!value?.startsWith("Bearer ")) throw new IdError("sign_in_required", "Sign in with Vihar ID to continue.", 401);
  return value.slice(7);
}
async function account(request: Request) {
  try { return await getAdmin().auth.verifyIdToken(bearer(request), true); }
  catch (error) {
    if (error instanceof IdError) throw error;
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (["auth/id-token-expired", "auth/id-token-revoked", "auth/invalid-id-token", "auth/argument-error", "auth/user-disabled", "auth/user-not-found"].includes(code)) throw new IdError("sign_in_required", "Sign in again to continue.", 401);
    throw error;
  }
}
function sameSite(request: Request) {
  const emulator = process.env.VIHAR_ID_EMULATOR === "true";
  const allowed = new URL(emulator ? request.url : process.env.SITE_URL || "https://vihar.online");
  // Next's development server normalizes its internal request URL to localhost
  // even when the browser uses 127.0.0.1. Accept loopback aliases only in the
  // emulator, preserving the protocol and port and exact production origin.
  const loopback = ["localhost", "127.0.0.1", "[::1]"];
  const origins = emulator && loopback.includes(allowed.hostname)
    ? loopback.map((hostname) => { const local = new URL(allowed); local.hostname = hostname; return local.origin; })
    : [allowed.origin];
  if (!origins.includes(request.headers.get("origin") || "")) throw new IdError("invalid_origin", "This action must start on Vihar.", 403);
}
async function game(gameId: string) {
  const { db } = getAdmin();
  const [listing, registration] = await db.getAll(db.doc(`communityGames/${gameId}`), db.doc(`gameIntegrations/${gameId}`));
  if (!listing.exists) throw new IdError("game_unavailable", "This game is unavailable.", 404);
  return { listing: listing.data()!, registration: registration.data() };
}
async function grant(request: Request, gameId: string) {
  const { db } = getAdmin();
  const tokenRef = db.doc(`gameTokens/${digest(bearer(request))}`);
  const token = (await tokenRef.get()).data() as Grant | undefined;
  if (!token || token.gameId !== gameId || token.expiresAt.toMillis() <= Date.now()) throw new IdError("session_expired", "Sign in again or launch from Vihar to reconnect.", 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== token.origin) throw new IdError("invalid_origin", "This token belongs to another game origin.", 403);
  const [{ listing, registration }, connection] = await Promise.all([game(gameId), db.doc(`players/${token.uid}/connections/${gameId}`).get()]);
  if (!registration?.enabled || registration.origin !== token.origin || registration.url !== listing.url || registration.authMode !== (listing.authMode || "none") || (!listing.published && listing.ownerId !== token.uid)) throw new IdError("game_unavailable", "This integration is disabled or its listing changed.", 403);
  if (!connection.exists || connection.data()!.version !== token.version || !connection.data()!.connected) throw new IdError("connection_revoked", "Reconnect this game from Vihar.", 401);
  return { token, tokenRef, listing, registration };
}
async function throttle(key: string, maximum: number, windowMs = 60_000) {
  const { db } = getAdmin();
  const ref = db.doc(`gameRateLimits/${digest(key)}`);
  await db.runTransaction(async (tx) => {
    const old = (await tx.get(ref)).data();
    const current = old && old.until > Date.now() ? old : { count: 0, until: Date.now() + windowMs };
    if (current.count >= maximum) throw new IdError("rate_limited", "Please wait a minute before trying again.", 429);
    tx.set(ref, { count: current.count + 1, until: current.until, expiresAt: Timestamp.fromMillis(current.until) });
  });
}
export async function idAction(action: string, input: Input, request: Request): Promise<unknown> {
  const { db } = getAdmin();
  const gameId = requireString(input.gameId, "gameId");
  if (["register", "info", "authorize", "launch", "disconnect"].includes(action)) {
    sameSite(request);
    const user = await account(request);
    if (action === "disconnect") {
      const ref = db.doc(`players/${user.uid}/connections/${gameId}`);
      await db.runTransaction(async (tx) => { const prior = (await tx.get(ref)).data(); tx.set(ref, { connected: false, version: (prior?.version || 0) + 1, title: prior?.title || "Unavailable game", updatedAt: Timestamp.now() }); });
      return { disconnected: true };
    }
    const { listing, registration } = await game(gameId);
    const owner = listing.ownerId === user.uid;
    if (!listing.published && !owner) throw new IdError("game_unavailable", "This game is not published.", 404);
    if (action === "register") {
      if (!owner) throw new IdError("not_owner", "Only the listing owner can configure this game.", 403);
      if (!user.email_verified) throw new IdError("verify_email", "Verify your email in your dashboard first.", 403);
      await throttle(`register:${user.uid}`, 10);
      const origin = gameOrigin(input.origin);
      if (origin !== new URL(listing.url).origin) throw new IdError("invalid_origin", "The integration origin must match the saved game URL.");
      const authMode = listing.authMode || "none";
      const unchanged = registration?.origin === origin && registration.url === listing.url && registration.authMode === authMode;
      await db.doc(`gameIntegrations/${gameId}`).set({ ownerId: user.uid, origin, url: listing.url, authMode, enabled: input.enabled !== false, verified: unchanged ? registration.verified || false : false, updatedAt: Timestamp.now() });
      return { registered: true, origin };
    }
    if (!registration?.enabled || registration.url !== listing.url || registration.authMode !== (listing.authMode || "none")) throw new IdError("integration_required", "The creator must register the current game URL and access mode in Creator studio.", 409);
    if (action === "info") return { title: listing.title, origin: registration.origin, authMode: registration.authMode, test: owner };
    const mode = action === "authorize" ? "identity" : "activity";
    if (mode === "identity" && registration.authMode !== "vihar-id") throw new IdError("login_not_required", "This game uses activity tracking without player login.");
    if (mode === "identity" && !(await db.doc(`profiles/${user.uid}`).get()).exists) throw new IdError("profile_required", "Finish creating your Vihar ID profile first.", 409);
    const challenge = mode === "identity" ? requireString(input.challenge, "PKCE challenge", /^[A-Za-z0-9_-]{43}$/) : "";
    if (mode === "identity" && input.origin !== registration.origin) throw new IdError("invalid_origin", "The game origin is not registered.", 403);
    await throttle(`code:${user.uid}`, 30);
    const code = secret();
    const connectionRef = db.doc(`players/${user.uid}/connections/${gameId}`);
    await db.runTransaction(async (tx) => {
      const prior = (await tx.get(connectionRef)).data();
      const version = prior?.version || 0;
      tx.set(connectionRef, { title: listing.title, origin: registration.origin, version, connected: true, updatedAt: Timestamp.now() });
      tx.create(db.doc(`gameCodes/${digest(code)}`), { uid: user.uid, gameId, origin: registration.origin, mode, challenge, version, expiresAt: expires(60_000) });
    });
    if (action === "launch") {
      const url = new URL(listing.url);
      // Preserve hash routers; the SDK removes only the appended ticket suffix.
      url.hash = `${url.hash.slice(1)}${url.hash ? "&" : ""}vihar_launch=${code}`;
      return { url: url.href };
    }
    return { code, expiresIn: 60 };
  }
  if (action === "token") {
    const code = requireString(input.code, "code", /^[A-Za-z0-9_-]{43}$/);
    const ref = db.doc(`gameCodes/${digest(code)}`);
    const token = secret();
    const result = await db.runTransaction(async (tx) => {
      const stored = (await tx.get(ref)).data();
      if (!stored || stored.expiresAt.toMillis() <= Date.now() || stored.gameId !== gameId) throw new IdError("invalid_code", "The connection code expired or was already used. Start again.", 401);
      if (request.headers.get("origin") !== stored.origin) throw new IdError("invalid_origin", "Exchange the code on the registered game origin.", 403);
      if (stored.mode === "identity" && digest(requireString(input.verifier, "PKCE verifier", /^[A-Za-z0-9._~-]{43,128}$/)) !== stored.challenge) throw new IdError("invalid_verifier", "The sign-in verification failed. Start again.", 401);
      const connection = (await tx.get(db.doc(`players/${stored.uid}/connections/${gameId}`))).data();
      if (!connection?.connected || connection.version !== stored.version) throw new IdError("connection_revoked", "The player disconnected this game.", 401);
      tx.delete(ref);
      tx.create(db.doc(`gameTokens/${digest(token)}`), { uid: stored.uid, gameId, origin: stored.origin, mode: stored.mode, version: stored.version, expiresAt: expires(lifetime) });
      return { mode: stored.mode };
    });
    return { accessToken: token, tokenType: "Bearer", expiresIn: lifetime / 1000, ...result };
  }
  const { token, tokenRef, listing } = await grant(request, gameId);
  if (action === "revoke") { await tokenRef.delete(); return { signedOut: true }; }
  if (["me", "save"].includes(action) && token.mode !== "identity") throw new IdError("identity_required", "Sign in with Vihar ID inside this game first.", 403);
  if (action === "me") {
    const profile = (await db.doc(`profiles/${token.uid}`).get()).data();
    if (!profile) throw new IdError("profile_required", "Complete your Vihar ID profile.", 409);
    return { sub: token.uid, gameId, username: profile.username, displayName: profile.displayName, avatarId: profile.avatarId };
  }
  if (action === "save") {
    const ref = db.doc(`players/${token.uid}/saves/${gameId}`);
    await throttle(`save:${token.uid}:${gameId}`, 60);
    if (input.operation === "read") { const saved = (await ref.get()).data(); return { data: saved ? JSON.parse(saved.json) : null, revision: saved?.revision || 0 }; }
    if (input.operation !== "write" || !Number.isSafeInteger(input.revision) || Number(input.revision) < 0) throw new IdError("invalid_request", "Supply operation write and the last read revision.");
    const json = progressData(input.data);
    return db.runTransaction(async (tx) => {
      const old = (await tx.get(ref)).data();
      if ((old?.revision || 0) !== input.revision) throw new IdError("save_conflict", "Another device saved progress. Load the latest save before retrying.", 409);
      const revision = Number(input.revision) + 1;
      tx.set(ref, { json, revision, updatedAt: Timestamp.now() });
      return { revision };
    });
  }
  if (action !== "session") throw new IdError("unknown_action", "Unknown Vihar ID action.", 404);
  const sessionId = requireString(input.sessionId, "sessionId", /^[A-Za-z0-9_-]{20,80}$/);
  const statsRef = db.doc(`players/${token.uid}/gameStats/${gameId}`);
  const sessionRef = db.doc(`players/${token.uid}/sessions/${sessionId}`);
  const ownerTest = listing.ownerId === token.uid;
  return db.runTransaction(async (tx) => {
    const [sessionSnap, statsSnap, currentToken, connectionSnap, integrationSnap] = await tx.getAll(sessionRef, statsRef, tokenRef, db.doc(`players/${token.uid}/connections/${gameId}`), db.doc(`gameIntegrations/${gameId}`));
    if (!currentToken.exists || !connectionSnap.data()?.connected || connectionSnap.data()?.version !== token.version) throw new IdError("connection_revoked", "This connection was disconnected.", 401);
    const now = Date.now(), timestamp = Timestamp.fromMillis(now);
    const previous = sessionSnap.data();
    const stats = statsSnap.data() || { sessions: 0, playMilliseconds: 0, dailySessions: {} };
    if (previous && (previous.gameId !== gameId || previous.tokenHash !== tokenRef.id)) throw new IdError("invalid_session", "This session belongs to another connection.", 403);
    if (input.operation === "start") {
      if (previous) return { sessionId, duplicate: true };
      if (stats.activeSessionId && now - (stats.lastSeenAt?.toMillis() || 0) < 90_000) throw new IdError("session_active", "This game is already tracking in another tab. Close it or wait 90 seconds.", 409);
      const dailySessions = { ...stats.dailySessions };
      dailySessions[new Date(now).toISOString().slice(0, 10)] = (dailySessions[new Date(now).toISOString().slice(0, 10)] || 0) + 1;
      // Keep the activity calendar bounded to one year; lifetime totals remain.
      for (const day of Object.keys(dailySessions)) if (day < new Date(now - 365 * 86400000).toISOString().slice(0, 10)) delete dailySessions[day];
      tx.create(sessionRef, { gameId, title: listing.title, tokenHash: tokenRef.id, startedAt: timestamp, lastSeenAt: timestamp, playMilliseconds: 0, sequence: 0, ended: false, expiresAt: expires(366 * 86400000) });
      tx.set(statsRef, { ...stats, gameId, title: listing.title, source: "communityGames", sessions: stats.sessions + 1, dailySessions, lastPlayedAt: timestamp, lastSeenAt: timestamp, activeSessionId: sessionId, test: ownerTest });
      if (!ownerTest) tx.set(db.doc(`communityGames/${gameId}/metrics/activity`), { sessions: FieldValue.increment(1), updatedAt: timestamp }, { merge: true });
      return { sessionId, test: ownerTest };
    }
    if (!["pulse", "end"].includes(String(input.operation)) || !Number.isSafeInteger(input.sequence) || Number(input.sequence) < 1) throw new IdError("invalid_request", "Supply a valid operation and sequence.");
    if (!previous) throw new IdError("invalid_session", "Start a session before sending activity.", 409);
    if (previous.ended || Number(input.sequence) <= previous.sequence) return { sessionId, duplicate: true };
    if (stats.activeSessionId !== sessionId) throw new IdError("session_replaced", "A newer game session is active.", 409);
    const ms = creditedMilliseconds(input.elapsedMs, previous.lastSeenAt.toMillis(), now);
    tx.update(sessionRef, { lastSeenAt: timestamp, playMilliseconds: previous.playMilliseconds + ms, sequence: input.sequence, ended: input.operation === "end" });
    tx.update(statsRef, { playMilliseconds: stats.playMilliseconds + ms, ...(ms > 0 ? { lastPlayedAt: timestamp } : {}), lastSeenAt: timestamp, ...(input.operation === "end" ? { activeSessionId: null } : {}) });
    if (!ownerTest) tx.set(db.doc(`communityGames/${gameId}/metrics/activity`), { playMilliseconds: FieldValue.increment(ms), updatedAt: timestamp }, { merge: true });
    // A successful owner test verifies tracking and, for account games, identity.
    if (ownerTest && ms > 0 && (listing.authMode !== "vihar-id" || token.mode === "identity") && !integrationSnap.data()?.verified) tx.update(integrationSnap.ref, { verified: true, verifiedAt: timestamp });
    return { sessionId, creditedMilliseconds: ms, ended: input.operation === "end", test: ownerTest };
  });
}
