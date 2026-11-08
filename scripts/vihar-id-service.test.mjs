import assert from "node:assert/strict";
import { before, beforeEach, after, test } from "node:test";
import { deleteApp } from "firebase-admin/app";
import { Timestamp } from "firebase-admin/firestore";
import { getAdmin } from "../src/lib/firebase/admin.ts";
import { idAction } from "../src/lib/vihar-id/service.ts";
import { digest, secret } from "../src/lib/vihar-id/protocol.ts";
import { getQuickPlayGame, quickPlayOrigin } from "../src/lib/quick-play.ts";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error("Run only with Firebase Auth and Firestore emulators.");
process.env.VIHAR_ID_EMULATOR = "true";
const base = "http://127.0.0.1:3000", origin = "https://studio.example.com";
let owner, player, stranger;
const { db, auth } = getAdmin();
async function createAccount(name) {
  const email = `${name}-${Date.now()}@example.test`, password = "Test-password-123";
  const root = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts`;
  const signup = await fetch(`${root}:signUp?key=demo-key`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) }).then((response) => response.json());
  assert(signup.localId);
  await auth.updateUser(signup.localId, { emailVerified: true });
  const signed = await fetch(`${root}:signInWithPassword?key=demo-key`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) }).then((response) => response.json());
  return { uid: signed.localId, token: signed.idToken };
}
const call = (action, input, token, requestOrigin = base) => idAction(action, input, new Request(`${base}/api/vihar-id/${action}`, { method: "POST", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(requestOrigin ? { Origin: requestOrigin } : {}) } }));
before(async () => { [owner, player, stranger] = await Promise.all([createAccount("owner"), createAccount("player"), createAccount("stranger")]); });
beforeEach(async () => {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-vihar/databases/(default)/documents`, { method: "DELETE" });
  for (const account of [owner, player, stranger]) await db.doc(`profiles/${account.uid}`).set({ uid: account.uid, username: `player_${account.uid.slice(0, 5)}`, displayName: "Test player", avatarId: "sun" });
  await db.doc("communityGames/test-game").set({ title: "Test Game", url: `${origin}/play`, ownerId: owner.uid, published: true, authMode: "vihar-id" });
  await call("register", { gameId: "test-game", origin }, owner.token);
});
after(async () => { await db.terminate(); await deleteApp(auth.app); });

test("unreleased Quick Play cannot mint launches or receipts, even with a counterfeit community listing", async () => {
  await db.doc("communityGames/chess").set({ title: "Counterfeit", url: `${origin}/play`, ownerId: player.uid, published: true, authMode: "none" });
  for (const action of ["launch", "receipt", "register", "info"]) await assert.rejects(call(action, { gameId: "chess", origin }, player.token), { code: "game_unavailable" });
  await assert.rejects(call("receipt", { gameId: "chess" }, null), { code: "sign_in_required" });
  assert.equal((await db.doc(`officialGames/chess/players/${player.uid}`).get()).exists, false);
});

test("released Quick Play reuses scoped activity and keeps official receipts, time and metrics isolated", async () => {
  const game = getQuickPlayGame("chess"), previous = game.release;
  game.release = { status: "playable", verifiedAt: "2026-11-09T00:00:00+05:30", modes: ["pass-and-play"], devices: ["Desktop"], controls: "Select a piece, then its destination." };
  try {
    await assert.rejects(call("register", { gameId: "chess", origin: quickPlayOrigin }, player.token), { code: "not_owner" });
    const launch = await call("launch", { gameId: "chess" }, player.token);
    assert(launch.url.startsWith(`${game.embedUrl}#vihar_launch=`));
    const code = new URL(launch.url).hash.split("=")[1];
    await assert.rejects(call("token", { gameId: "chess", code }, null, origin), { code: "invalid_origin" });
    const { accessToken } = await call("token", { gameId: "chess", code }, null, quickPlayOrigin);
    await assert.rejects(call("me", { gameId: "chess" }, accessToken, quickPlayOrigin), { code: "identity_required" });
    await assert.rejects(call("save", { gameId: "chess", operation: "read" }, accessToken, quickPlayOrigin), { code: "identity_required" });
    await assert.rejects(call("receipt", { gameId: "chess" }, player.token, quickPlayOrigin), { code: "invalid_origin" });
    await call("receipt", { gameId: "chess", restore: true }, player.token);
    assert.equal((await db.collection(`players/${player.uid}/activity`).get()).size, 0);
    const receipt = await db.doc(`officialGames/chess/players/${player.uid}`).get();
    await call("receipt", { gameId: "chess", title: "Counterfeit title", uid: stranger.uid }, player.token);
    assert.equal((await db.doc(`officialGames/chess/players/${player.uid}`).get()).data().startedAt.toMillis(), receipt.data().startedAt.toMillis());
    assert.equal((await db.doc(`officialGames/chess/players/${stranger.uid}`).get()).exists, false);
    const activity = (await db.collection(`players/${player.uid}/activity`).get()).docs[0].data();
    assert.equal(activity.title, "Chess"); assert.equal(activity.source, "officialGames");
    assert.equal((await db.doc(`players/${player.uid}/gameStats/chess`).get()).exists, false, "Opening a frame is not a gameplay session");
    const sessionId = secret();
    await call("session", { gameId: "chess", sessionId, operation: "start" }, accessToken, quickPlayOrigin);
    await db.doc(`players/${player.uid}/sessions/${sessionId}`).update({ lastSeenAt: Timestamp.fromMillis(Date.now() - 10_000) });
    await call("session", { gameId: "chess", sessionId, operation: "end", sequence: 1, elapsedMs: 7_000 }, accessToken, quickPlayOrigin);
    const stats = (await db.doc(`players/${player.uid}/gameStats/chess`).get()).data();
    assert.equal(stats.source, "officialGames"); assert.equal(stats.playMilliseconds, 7_000); assert.equal(stats.sessions, 1);
    assert.equal((await db.doc("officialGames/chess/metrics/activity").get()).data().playMilliseconds, 7_000);
    assert.equal((await db.doc("communityGames/chess/metrics/activity").get()).exists, false);
    await db.doc(`gameTokens/${digest(accessToken)}`).update({ source: "communityGames" });
    await assert.rejects(call("session", { gameId: "chess", sessionId, operation: "start" }, accessToken, quickPlayOrigin), { code: "game_unavailable" });
    game.release = previous;
    await assert.rejects(call("launch", { gameId: "chess" }, player.token), { code: "game_unavailable" });
  } finally { game.release = previous; }
});
async function identity(account = player, gameId = "test-game") {
  const verifier = secret();
  const code = await call("authorize", { gameId, origin, challenge: digest(verifier) }, account.token);
  const result = await call("token", { gameId, code: code.code, verifier }, null, origin);
  return result.accessToken;
}
test("registration rejects other owners and mismatched origins", async () => {
  await assert.rejects(call("register", { gameId: "test-game", origin }, player.token), { code: "not_owner" });
  await assert.rejects(call("register", { gameId: "test-game", origin: "https://other.example.com" }, owner.token), { code: "invalid_origin" });
  await assert.rejects(call("authorize", { gameId: "test-game", origin, challenge: digest(secret()) }, player.token, origin), { code: "invalid_origin" });
});
test("local account requests allow loopback aliases but reject other ports and hosts", async () => {
  const result = await call("info", { gameId: "test-game" }, player.token, "http://localhost:3000");
  assert.equal(result.title, "Test Game");
  for (const requestOrigin of ["http://localhost:3001", "https://localhost:3000", "http://studio.example.com:3000", null]) {
    await assert.rejects(call("info", { gameId: "test-game" }, player.token, requestOrigin), { code: "invalid_origin" });
  }
});
test("identity codes require PKCE, exact origin, one use and expiry", async () => {
  const verifier = secret();
  const { code } = await call("authorize", { gameId: "test-game", origin, challenge: digest(verifier) }, player.token);
  await assert.rejects(call("token", { gameId: "test-game", code, verifier: secret() }, null, origin), { code: "invalid_verifier" });
  await assert.rejects(call("token", { gameId: "test-game", code, verifier }, null, "https://evil.example.com"), { code: "invalid_origin" });
  const token = await call("token", { gameId: "test-game", code, verifier }, null, origin);
  await assert.rejects(call("token", { gameId: "test-game", code, verifier }, null, origin), { code: "invalid_code" });
  const me = await call("me", { gameId: "test-game" }, token.accessToken, origin);
  assert.equal(me.sub, player.uid); assert.equal(me.email, undefined);
  await assert.rejects(call("me", { gameId: "other-game" }, token.accessToken, origin), { code: "session_expired" });
  const next = await call("authorize", { gameId: "test-game", origin, challenge: digest(verifier) }, player.token);
  await db.doc(`gameCodes/${digest(next.code)}`).update({ expiresAt: Timestamp.fromMillis(0) });
  await assert.rejects(call("token", { gameId: "test-game", code: next.code, verifier }, null, origin), { code: "invalid_code" });
});
test("direct-play launch tickets permit activity without revealing identity or saves", async () => {
  await db.doc("communityGames/test-game").update({ authMode: "none", url: `${origin}/play#/level/2` });
  await call("register", { gameId: "test-game", origin }, owner.token);
  const launch = await call("launch", { gameId: "test-game" }, player.token);
  assert(launch.url.includes("#/level/2&vihar_launch="));
  const code = launch.url.split("vihar_launch=")[1];
  const { accessToken, mode } = await call("token", { gameId: "test-game", code }, null, origin);
  assert.equal(mode, "activity");
  for (const action of ["me", "save"]) await assert.rejects(call(action, { gameId: "test-game", operation: "read" }, accessToken, origin), { code: "identity_required" });
  await call("session", { gameId: "test-game", sessionId: secret(), operation: "start" }, accessToken, origin);
});
test("saves are isolated across players and games and protect concurrent revisions", async () => {
  const token = await identity(), other = await identity(stranger);
  const first = await call("save", { gameId: "test-game", operation: "write", revision: 0, data: { level: 3 } }, token, origin);
  assert.equal(first.revision, 1);
  assert.deepEqual(await call("save", { gameId: "test-game", operation: "read" }, token, null), { data: { level: 3 }, revision: 1 });
  assert.deepEqual(await call("save", { gameId: "test-game", operation: "read" }, other, origin), { data: null, revision: 0 });
  const writes = await Promise.allSettled([4, 5].map((level) => call("save", { gameId: "test-game", operation: "write", revision: 1, data: { level } }, token, origin)));
  assert.equal(writes.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(writes.find((result) => result.status === "rejected").reason.code, "save_conflict");
});
test("sessions deduplicate starts and pulses, enforce one active tab, and update private and creator totals", async () => {
  const token = await identity(), sessionId = secret();
  const args = { gameId: "test-game", sessionId };
  await call("session", { ...args, operation: "start" }, token, origin);
  await call("session", { ...args, operation: "start" }, token, origin);
  await assert.rejects(call("session", { ...args, sessionId: secret(), operation: "start" }, token, origin), { code: "session_active" });
  await db.doc(`players/${player.uid}/sessions/${sessionId}`).update({ lastSeenAt: Timestamp.fromMillis(Date.now() - 20000) });
  const pulse = { ...args, operation: "pulse", sequence: 1, elapsedMs: 15000 };
  await call("session", pulse, token, origin);
  await call("session", pulse, token, origin);
  let stats = (await db.doc(`players/${player.uid}/gameStats/test-game`).get()).data();
  assert.equal(stats.sessions, 1); assert.equal(stats.playMilliseconds, 15000);
  assert.equal(Object.values(stats.dailySessions).reduce((a, b) => a + b, 0), 1);
  const metrics = (await db.doc("communityGames/test-game/metrics/activity").get()).data();
  assert.equal(metrics.sessions, 1); assert.equal(metrics.playMilliseconds, 15000);
  const lastPlayedAt = stats.lastPlayedAt.toMillis();
  await db.doc(`players/${player.uid}/sessions/${sessionId}`).update({ lastSeenAt: Timestamp.fromMillis(Date.now() - 100000) });
  await call("session", { ...args, operation: "end", sequence: 2, elapsedMs: 45000 }, token, origin);
  stats = (await db.doc(`players/${player.uid}/gameStats/test-game`).get()).data();
  assert.equal(stats.playMilliseconds, 15000); assert.equal(stats.activeSessionId, null);
  assert.equal(stats.lastPlayedAt.toMillis(), lastPlayedAt, "An uncredited offline interval must not change when the player last played.");
});
test("owner tests verify the integration without inflating creator metrics", async () => {
  const token = await identity(owner), sessionId = secret();
  await call("session", { gameId: "test-game", sessionId, operation: "start" }, token, origin);
  await db.doc(`players/${owner.uid}/sessions/${sessionId}`).update({ lastSeenAt: Timestamp.fromMillis(Date.now() - 20000) });
  await call("session", { gameId: "test-game", sessionId, operation: "end", sequence: 1, elapsedMs: 15000 }, token, origin);
  assert.equal((await db.doc("gameIntegrations/test-game").get()).data().verified, true);
  assert.equal((await db.doc("communityGames/test-game/metrics/activity").get()).exists, false);
});
test("disconnect revokes all current tokens and pending codes without deleting saves", async () => {
  const token = await identity(), token2 = await identity();
  await call("save", { gameId: "test-game", operation: "write", revision: 0, data: { level: 2 } }, token, origin);
  const verifier = secret(), pending = await call("authorize", { gameId: "test-game", origin, challenge: digest(verifier) }, player.token);
  await call("disconnect", { gameId: "test-game" }, player.token);
  for (const value of [token, token2]) await assert.rejects(call("me", { gameId: "test-game" }, value, origin), { code: "connection_revoked" });
  await assert.rejects(call("token", { gameId: "test-game", code: pending.code, verifier }, null, origin), { code: "connection_revoked" });
  const fresh = await identity();
  assert.equal((await call("save", { gameId: "test-game", operation: "read" }, fresh, origin)).data.level, 2);
  await assert.rejects(call("me", { gameId: "test-game" }, token, origin), { code: "connection_revoked" });
  await call("revoke", { gameId: "test-game" }, fresh, origin);
  await assert.rejects(call("me", { gameId: "test-game" }, fresh, origin), { code: "session_expired" });
});
test("disabled integrations, changed URLs and unpublished games stop player access", async () => {
  const token = await identity();
  await call("register", { gameId: "test-game", origin, enabled: false }, owner.token);
  await assert.rejects(call("me", { gameId: "test-game" }, token, origin), { code: "game_unavailable" });
  await call("register", { gameId: "test-game", origin }, owner.token);
  await db.doc("communityGames/test-game").update({ url: `${origin}/different` });
  await assert.rejects(call("me", { gameId: "test-game" }, token, origin), { code: "game_unavailable" });
  await db.doc("communityGames/test-game").update({ url: `${origin}/play`, published: false });
  await assert.rejects(call("me", { gameId: "test-game" }, token, origin), { code: "game_unavailable" });
});
