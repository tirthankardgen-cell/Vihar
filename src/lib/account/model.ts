export const avatars = [
  { id: "sun", name: "Vanguard", color: "#efb45c" },
  { id: "moon", name: "Phantom", color: "#b2a0ef" },
  { id: "tiger", name: "Ronin", color: "#ec826d" },
  { id: "frog", name: "Vector", color: "#83ccbb" },
  { id: "kite", name: "Nomad", color: "#dfba8e" },
  { id: "planet", name: "Orbit", color: "#9ebfe9" },
] as const;

export type AvatarId = (typeof avatars)[number]["id"];
export type StoredTime = { toMillis(): number; toDate(): Date } | null;
export type PlayerProfile = {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  avatarId: AvatarId;
  createdAt: StoredTime;
  updatedAt: StoredTime;
};
export type GameStats = {
  gameId: string;
  sessions: number;
  playSeconds: number;
  bestScore?: number;
  distanceMeters?: number;
  lastPlayedAt: StoredTime;
  /** Trusted game backends may publish session totals keyed by UTC YYYY-MM-DD. */
  dailySessions?: Record<string, number>;
};
/** Private website activity, distinct from trusted in-game statistics. */
export type GameLaunch = {
  id: string;
  gameId: string;
  source: "officialGames" | "communityGames";
  title: string;
  startedAt: StoredTime;
};
export type Friendship = {
  id: string;
  from: string;
  to: string;
  members: string[];
  status: "pending" | "accepted";
  createdAt: StoredTime;
  updatedAt: StoredTime;
};

const reserved = new Set(["admin", "administrator", "vihar", "support", "system", "moderator", "official", "help", "account", "deleted"]);
export function normalizeUsername(value: string) { return value.trim().toLowerCase().replace(/^@/, ""); }
export function usernameError(value: string): string | null {
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(value)) return "Use 3–20 lowercase letters, numbers or underscores. Start with a letter.";
  if (reserved.has(value)) return "This username is reserved. Pick another one.";
  return null;
}
export function safeReturnPath(value: string | null | undefined) {
  if (!value || !/^(\/dashboard(?:\/(?:friends|settings|games|publish))?|\/games\/(?:bap-ka-rasta|gulam-chor)|\/community\/[A-Za-z0-9_-]{1,128}|\/u\/[a-z][a-z0-9_]{2,19})$/.test(value)) return "/dashboard";
  return value.startsWith("/u/") && usernameError(value.slice(3)) ? "/dashboard" : value;
}
export function playTime(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}
export function memberSince(time: StoredTime) {
  return time ? new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(time.toDate()) : "Just joined";
}
export function accountError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "That email and password don’t match. Try again or reset your password.",
    "auth/wrong-password": "That email and password don’t match. Try again or reset your password.",
    "auth/user-not-found": "That email and password don’t match. Try again or reset your password.",
    "auth/email-already-in-use": "This email already has an account. Sign in or reset your password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/password-does-not-meet-requirements": "Use at least 8 characters, including a letter and a number.",
    "auth/too-many-requests": "Too many attempts. Please wait a little before trying again.",
    "auth/network-request-failed": "Check your connection and try again.",
    "auth/popup-closed-by-user": "Google sign-in was closed. You can try again.",
    "auth/cancelled-popup-request": "Another sign-in window is already open.",
    "auth/popup-blocked": "Allow pop-ups for this site, then try Google sign-in again.",
    "auth/account-exists-with-different-credential": "Sign in with your existing method, then connect Google in Account settings.",
    "auth/credential-already-in-use": "That Google account belongs to another Vihar ID. Sign in to that account instead.",
    "auth/provider-already-linked": "This sign-in method is already connected to your account.",
    "auth/requires-recent-login": "Sign out and sign in again before making this change.",
    "auth/expired-action-code": "This link has expired. Request a new email and try again.",
    "auth/invalid-action-code": "This link has already been used or is invalid. Request a new email.",
    "auth/unauthorized-domain": "Sign-in is not enabled at this website address yet. Please use vihar.online.",
    "auth/operation-not-allowed": "This sign-in method is not available yet. Please try again later.",
    "auth/user-disabled": "This account is disabled. Please contact Vihar support.",
    "permission-denied": "This action isn’t available. Check that you’re signed in and your email is verified.",
    "unavailable": "Vihar couldn’t connect. Check your connection and try again.",
    "username-taken": "That username is already taken. Try a different one.",
    "firebase/not-configured": "Account sign-in is temporarily unavailable. Please try again later.",
  };
  return messages[code] || "Something went wrong. Please try again.";
}
