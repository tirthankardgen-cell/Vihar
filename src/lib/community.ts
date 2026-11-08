import { collection, doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";
import { games } from "@/lib/games";
import { getQuickPlayGame } from "./quick-play";
import { accountIdAction } from "./vihar-id/client";

import type { GameDetails } from "./game-publishing";
export type CommunityGame = Partial<GameDetails> & { id: string; ownerId: string; title: string; description: string; url: string; kind: "browser" | "download"; published: boolean };
export type GameReview = { id: string; rating: number; text: string };

export { gameUrl } from "./game-publishing";

export type GameSource = "communityGames" | "officialGames";

export async function ensureLaunchReceipt(gameId: string, uid: string, source: GameSource) {
  if (source === "officialGames" && getQuickPlayGame(gameId)) {
    if (getFirebase().auth.currentUser?.uid !== uid) throw new Error("Sign in again to record this game.");
    await accountIdAction("receipt", { gameId, restore: true });
    return;
  }
  const ref = doc(getFirebase().db, source, gameId, "players", uid);
  if (!(await getDoc(ref)).exists()) {
    try { await setDoc(ref, { startedAt: serverTimestamp() }); }
    catch (error) { if (!(await getDoc(ref)).exists()) throw error; }
  }
}

const guestKey = (gameId: string, source: GameSource) => `vihar:played:${source}:${gameId}`;
export function rememberGuestLaunch(gameId: string, source: GameSource) {
  try { sessionStorage.setItem(guestKey(gameId, source), "1"); } catch { /* Optional sign-in continuity. */ }
}
export async function restoreGuestLaunch(gameId: string, uid: string, source: GameSource) {
  let pending = false;
  try { pending = sessionStorage.getItem(guestKey(gameId, source)) === "1"; } catch { /* Play again when storage is unavailable. */ }
  if (!pending) return;
  // Preserve review eligibility after guest play, without inventing dated activity.
  await ensureLaunchReceipt(gameId, uid, source);
  try { sessionStorage.removeItem(guestKey(gameId, source)); } catch { /* Receipt is idempotent. */ }
}

export async function recordLaunch(gameId: string, uid: string, source: GameSource = "communityGames") {
  if (source === "officialGames" && getQuickPlayGame(gameId)) {
    if (getFirebase().auth.currentUser?.uid !== uid) throw new Error("Sign in again to record this game.");
    await accountIdAction("receipt", { gameId });
    window.dispatchEvent(new CustomEvent("vihar:game-opened", { detail: { gameId, source } }));
    return;
  }
  const { db } = getFirebase();
  const receipt = doc(db, source, gameId, "players", uid);
  const activity = doc(collection(db, "players", uid, "activity"));
  await runTransaction(db, async (transaction) => {
    const previous = await transaction.get(receipt);
    const title = source === "officialGames" ? games.find((game) => game.slug === gameId)?.title
      : (await transaction.get(doc(db, source, gameId))).data()?.title;
    if (!title) throw new Error("Game unavailable.");
    if (!previous.exists()) transaction.set(receipt, { startedAt: serverTimestamp() });
    transaction.set(activity, { gameId, source, title, startedAt: serverTimestamp() });
  });
  window.dispatchEvent(new CustomEvent("vihar:game-opened", { detail: { gameId, source } }));
}
