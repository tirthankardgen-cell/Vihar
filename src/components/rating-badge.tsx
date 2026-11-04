"use client";

import { useEffect, useState } from "react";
import { average, collection, count, getAggregateFromServer } from "firebase/firestore";
import { Star } from "lucide-react";
import { getFirebase } from "@/lib/firebase/client";
import "@/app/rating-badge.css";
type ReviewSource = "communityGames" | "officialGames";

export function RatingBadge({ id, source = "communityGames", upcoming = false }: { id: string; source?: ReviewSource; upcoming?: boolean }) {
  const [summary, setSummary] = useState<{ rating: number | null; count: number } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (upcoming) return;
    let active = true;
    try { void getAggregateFromServer(collection(getFirebase().db, source, id, "reviews"), { rating: average("rating"), count: count() }).then((result) => { if (active) { setSummary(result.data()); setFailed(false); } }).catch(() => { if (active) setFailed(true); }); }
    catch { queueMicrotask(() => { if (active) setFailed(true); }); }
    return () => { active = false; };
  }, [id, source, upcoming]);
  return <span className="game-rating-badge"><Star size={14} aria-hidden="true" fill="currentColor" />{upcoming ? "Not released" : failed ? "Rating unavailable" : !summary ? "Rating…" : summary.count ? `${summary.rating!.toFixed(1)} · ${summary.count}` : "Not rated yet"}</span>;
}

