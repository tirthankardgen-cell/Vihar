import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";

export type CommunityGame = { id: string; ownerId: string; title: string; description: string; url: string; kind: "browser" | "download"; published: boolean };
export type GameReview = { id: string; rating: number; text: string };

export function gameUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" || url.username || url.password || url.port || !/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(url.hostname)) {
    throw new Error("Use a public HTTPS game URL without a port or login details.");
  }
  return url.href;
}

export async function recordLaunch(gameId: string, uid: string) {
  const ref = doc(getFirebase().db, "communityGames", gameId, "players", uid);
  if (!(await getDoc(ref)).exists()) {
    try { await setDoc(ref, { startedAt: serverTimestamp() }); }
    catch (error) { if (!(await getDoc(ref)).exists()) throw error; }
  }
}
