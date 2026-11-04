"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { accountError } from "@/lib/account/model";
import { recordLaunch, type GameReview } from "@/lib/community";
import { games } from "@/lib/games";
import "@/app/community.css";

export type ReviewSource = "communityGames" | "officialGames";

export function Reviews({ id, source = "communityGames", ownerId, published = true, allowWrite = false }: { id: string; source?: ReviewSource; ownerId?: string; published?: boolean; allowWrite?: boolean }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]), [error, setError] = useState(""), [loaded, setLoaded] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  useEffect(() => {
    try { return onSnapshot(collection(getFirebase().db, source, id, "reviews"), (snapshot) => { setReviews(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as GameReview)); setLoaded(true); setError(""); }, (failure) => setError(accountError(failure))); }
    catch (failure) { queueMicrotask(() => setError(accountError(failure))); }
  }, [id, source]);
  const mine = reviews.find((review) => review.id === user?.uid);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user || busy) return;
    const data = new FormData(event.currentTarget); setBusy(true); setError(""); setMessage("");
    try {
      const text = String(data.get("text")).trim();
      if (!text) throw new Error("Write a review before saving.");
      await setDoc(doc(getFirebase().db, source, id, "reviews", user.uid), { rating: Number(data.get("rating")), text, updatedAt: serverTimestamp() }); setMessage("Your review is saved.");
    } catch { setError("Could not save your review. Open the game using the play button on this page first, then try again."); } finally { setBusy(false); }
  }
  async function remove() {
    if (!user || busy) return; setBusy(true); setError("");
    try { await deleteDoc(doc(getFirebase().db, source, id, "reviews", user.uid)); setMessage("Review deleted."); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  const path = source === "officialGames" ? `/games/${id}` : `/community/${id}`;
  return <section className="community-reviews" id={`reviews-${id}`}><p className="eyebrow">The player perspective</p><h2>Ratings & reviews</h2>{!loaded ? <p role="status">{error ? "Reviews are unavailable right now." : "Loading reviews…"}</p> : <><div className="review-overview"><div><strong className="review-score">{reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "—"}</strong><p>out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div><div className="rating-distribution">{[5,4,3,2,1].map((rating) => <div key={rating}><span>{rating} ★</span><meter min={0} max={Math.max(reviews.length, 1)} value={reviews.filter((review) => review.rating === rating).length} aria-label={`${rating} star reviews`} /><span>{reviews.filter((review) => review.rating === rating).length}</span></div>)}</div></div>{!reviews.length && <p>Be the first to share your experience.</p>}</>}{reviews.map((review) => <blockquote key={review.id}><strong>{"★".repeat(review.rating)}<span className="sr-only"> {review.rating} out of 5</span>{review.id === user?.uid ? " · Your review" : " · Player"}</strong><p>{review.text}</p></blockquote>)}{allowWrite && !user && <Link className="text-link" href={`/login?next=${encodeURIComponent(path)}`}>Sign in to rate & review →</Link>}{allowWrite && user && user.uid !== ownerId && published && <form key={mine ? `${user.uid}-${mine.rating}-${mine.text}` : user.uid} className="community-form" onSubmit={save}><h3>{mine ? "Your review" : "How was your game?"}</h3><p>Open the game from this page, give it a play, then share your experience.</p><fieldset className="rating-picker"><legend>Your rating</legend>{[1,2,3,4,5].map((rating) => <label key={rating}><input type="radio" name="rating" value={rating} defaultChecked={rating === (mine?.rating ?? 5)} required /><span>{rating} ★</span></label>)}</fieldset><label>Your review<textarea name="text" required maxLength={1000} rows={3} defaultValue={mine?.text ?? ""} placeholder="What did you enjoy? What could be better?" /></label><div className="community-actions"><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : mine ? "Update review" : "Post review"}</button>{mine && <button type="button" disabled={busy} onClick={() => void remove()}>Delete my review</button>}</div></form>}{error && <p role="alert" className="account-error">{error}</p>}<p role="status">{message}</p></section>;
}

export function OfficialGameReviews({ id }: { id: string }) {
  const game = games.find((item) => item.slug === id);
  if (!game) return null;
  if (game.status !== "playable") return <section className="community-reviews"><h2>Ratings & reviews</h2><p>Player reviews open when this game is released.</p></section>;
  return <><OfficialPlayLink id={id} className="button button-dark">Play & come back to review ↗</OfficialPlayLink><Reviews id={id} source="officialGames" allowWrite /></>;
}
export function OfficialPlayLink({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const game = games.find((item) => item.slug === id);
  if (!game || game.status !== "playable") return null;
  return <><a href={game.playUrl} target="_blank" rel="noopener noreferrer" className={className} onClick={() => { if (user) void recordLaunch(id, user.uid, "officialGames").catch(() => setError("Your game opened, but the launch could not be recorded for reviews. Please try again.")); }}>{children}</a>{error && <p role="alert" className="account-error">{error}</p>}</>;
}
