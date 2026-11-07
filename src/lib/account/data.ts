import {
  collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query,
  runTransaction, serverTimestamp, updateDoc, where, orderBy, Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebase } from "../firebase/client";
import { normalizeUsername, usernameError, type AvatarId, type Friendship, type GameLaunch, type GameStats, type PlayerProfile } from "./model";

export function watchProfile(uid: string, receive: (profile: PlayerProfile | null) => void, fail: (error: unknown) => void) {
  return onSnapshot(doc(getFirebase().db, "profiles", uid), (snapshot) => receive(snapshot.exists() ? snapshot.data() as PlayerProfile : null), fail);
}
export async function profileByUsername(value: string) {
  const username = normalizeUsername(value);
  if (usernameError(username)) return null;
  const { db } = getFirebase();
  const claim = await getDoc(doc(db, "usernames", username));
  if (!claim.exists()) return null;
  const profile = await getDoc(doc(db, "profiles", claim.data().uid));
  return profile.exists() ? profile.data() as PlayerProfile : null;
}
export async function isUsernameAvailable(username: string) {
  if (usernameError(username)) return false;
  return !(await getDoc(doc(getFirebase().db, "usernames", username))).exists();
}
export async function createProfile(user: User, values: { username: string; displayName: string; bio: string; avatarId: AvatarId }) {
  const { db } = getFirebase();
  const username = normalizeUsername(values.username);
  const validation = usernameError(username);
  if (validation) throw new Error(validation);
  await runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "profiles", user.uid);
    const claimRef = doc(db, "usernames", username);
    const [profile, claim] = await Promise.all([transaction.get(profileRef), transaction.get(claimRef)]);
    if (profile.exists()) return;
    if (claim.exists()) throw Object.assign(new Error("Username taken"), { code: "username-taken" });
    transaction.set(claimRef, { uid: user.uid });
    transaction.set(profileRef, {
      uid: user.uid, username, displayName: values.displayName.trim(), bio: values.bio.trim(), avatarId: values.avatarId,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  });
}
export async function editProfile(uid: string, values: Pick<PlayerProfile, "displayName" | "bio" | "avatarId">) {
  await updateDoc(doc(getFirebase().db, "profiles", uid), { ...values, displayName: values.displayName.trim(), bio: values.bio.trim(), updatedAt: serverTimestamp() });
}
export function watchStats(uid: string, receive: (stats: GameStats[]) => void, fail: (error: unknown) => void) {
  return onSnapshot(collection(getFirebase().db, "profiles", uid, "stats"), (snapshot) => receive(snapshot.docs.map((entry) => ({ ...entry.data(), gameId: entry.id }) as GameStats)), fail);
}
export function watchActivity(uid: string, receive: (activity: GameLaunch[]) => void, fail: (error: unknown) => void) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 364);
  return onSnapshot(query(collection(getFirebase().db, "players", uid, "activity"), where("startedAt", ">=", Timestamp.fromDate(start)), orderBy("startedAt", "desc")), (snapshot) => {
    receive(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as GameLaunch).filter((entry) => entry.startedAt));
  }, fail);
}
export function watchFavorites(uid: string, receive: (ids: string[]) => void, fail: (error: unknown) => void) {
  return onSnapshot(collection(getFirebase().db, "players", uid, "favorites"), (snapshot) => receive(snapshot.docs.map((entry) => entry.id)), fail);
}
export async function setFavorite(uid: string, game: string, favorite: boolean) {
  const ref = doc(getFirebase().db, "players", uid, "favorites", game);
  if (favorite) await runTransaction(getFirebase().db, async (transaction) => {
    if (!(await transaction.get(ref)).exists()) transaction.set(ref, { addedAt: serverTimestamp() });
  });
  else await deleteDoc(ref);
}
export function watchFriends(uid: string, receive: (friends: Friendship[]) => void, fail: (error: unknown) => void) {
  const request = query(collection(getFirebase().db, "friendships"), where("members", "array-contains", uid));
  return onSnapshot(request, (snapshot) => receive(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as Friendship)), fail);
}
export async function sendFriendRequest(from: string, to: string) {
  if (from === to) return;
  const { auth, db } = getFirebase();
  // Email verification in another tab may leave a cached, unverified JWT.
  // The rules remain authoritative; refresh the claim before verified actions.
  await auth.currentUser?.getIdToken(true);
  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "friendships", `${from}__${to}`);
    const reverse = doc(db, "friendships", `${to}__${from}`);
    const [outgoing, incoming] = await Promise.all([transaction.get(ref), transaction.get(reverse)]);
    if (outgoing.exists() || incoming.exists()) return;
    transaction.set(ref, { from, to, members: [from, to], status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
}
export async function acceptFriendRequest(id: string) {
  const { auth, db } = getFirebase();
  await auth.currentUser?.getIdToken(true);
  await updateDoc(doc(db, "friendships", id), { status: "accepted", updatedAt: serverTimestamp() });
}
export async function removeFriendship(id: string) { await deleteDoc(doc(getFirebase().db, "friendships", id)); }
export async function exportAccount(user: User, profile: PlayerProfile) {
  const { db } = getFirebase();
  const [stats, favorites, friends, activity] = await Promise.all([
    getDocs(collection(db, "profiles", user.uid, "stats")),
    getDocs(collection(db, "players", user.uid, "favorites")),
    getDocs(query(collection(db, "friendships"), where("members", "array-contains", user.uid))),
    getDocs(collection(db, "players", user.uid, "activity")),
  ]);
  const rows = (snapshot: typeof stats) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  return { exportedAt: new Date().toISOString(), account: { uid: user.uid, email: user.email, emailVerified: user.emailVerified }, profile, stats: rows(stats), favorites: rows(favorites), friendships: rows(friends), activity: rows(activity) };
}
