import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";

import type { GameDetails } from "./game-publishing";
export type CommunityGame = Partial<GameDetails> & { id: string; ownerId: string; title: string; description: string; url: string; kind: "browser" | "download"; published: boolean };
export type GameReview = { id: string; rating: number; text: string };

export { gameUrl } from "./game-publishing";

export async function recordLaunch(gameId: string, uid: string, source: "communityGames" | "officialGames" = "communityGames") {
  const ref = doc(getFirebase().db, source, gameId, "players", uid);
  if (!(await getDoc(ref)).exists()) {
    try { await setDoc(ref, { startedAt: serverTimestamp() }); }
    catch (error) { if (!(await getDoc(ref)).exists()) throw error; }
  }
}
