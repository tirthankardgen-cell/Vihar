"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";
import { playTime } from "@/lib/account/model";

export function CreatorPlayMetrics({ gameId }: { gameId: string }) {
  const [metrics, setMetrics] = useState<{ sessions?: number; playMilliseconds?: number } | null>(null), [error, setError] = useState(false);
  useEffect(() => onSnapshot(doc(getFirebase().db, "communityGames", gameId, "metrics", "activity"), (snapshot) => { setMetrics(snapshot.data() || {}); setError(false); }, () => setError(true)), [gameId]);
  return <><div className="studio-metrics"><div><span>Connected sessions</span><strong>{error || !metrics ? "—" : metrics.sessions || 0}</strong></div><div><span>Recorded play time</span><strong>{error || !metrics ? "—" : metrics.playMilliseconds && metrics.playMilliseconds < 60000 ? "<1m" : playTime((metrics.playMilliseconds || 0) / 1000)}</strong></div></div><p className="community-note">{error ? "Connected metrics could not load." : "Gameplay reported by connected players. Excludes your integration tests, guest visits and offline gaps."}</p></>;
}
