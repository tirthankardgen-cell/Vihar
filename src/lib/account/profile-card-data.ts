import { avatars, normalizeUsername, usernameError, type AvatarId } from "./model";

type FirestoreValue = { stringValue?: string; timestampValue?: string };
type PublicDocument = { fields?: Record<string, FirestoreValue> };
export type ProfileCardData = { username: string; displayName: string; avatarId: AvatarId; joined: string; version: string };

/** Uses the same exact public reads allowed by Firestore rules, with no admin key. */
export async function getProfileCardData(value: string): Promise<ProfileCardData | null> {
  const username = normalizeUsername(value);
  if (usernameError(username)) return null;
  const emulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";
  const projectId = emulators ? "demo-vihar" : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Firebase project is not configured.");
  const origin = emulators ? "http://127.0.0.1:8080" : "https://firestore.googleapis.com";
  const base = `${origin}/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;

  async function read(path: string): Promise<PublicDocument | null> {
    const response = await fetch(`${base}/${path}`, { next: { revalidate: emulators ? 0 : 60 }, signal: AbortSignal.timeout(6000) });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Public profile is temporarily unavailable.");
    return response.json() as Promise<PublicDocument>;
  }

  const claim = await read(`usernames/${encodeURIComponent(username)}`);
  const uid = claim?.fields?.uid?.stringValue;
  if (!uid || typeof uid !== "string") return null;
  const profile = await read(`profiles/${encodeURIComponent(uid)}`);
  const fields = profile?.fields;
  const displayName = fields?.displayName?.stringValue;
  if (fields?.username?.stringValue !== username || fields?.uid?.stringValue !== uid || !displayName || typeof displayName !== "string") return null;
  const avatar = avatars.find((item) => item.id === fields?.avatarId?.stringValue) || avatars[0];
  const created = Date.parse(fields?.createdAt?.timestampValue || "");
  const updated = Date.parse(fields?.updatedAt?.timestampValue || "");
  return {
    username,
    displayName: displayName.slice(0, 32),
    avatarId: avatar.id,
    joined: Number.isFinite(created) ? new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(created) : "",
    version: Number.isFinite(updated) ? String(updated) : "0",
  };
}
