"use client";

import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { MessageSquare, Star } from "lucide-react";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { accountError } from "@/lib/account/model";
import { restoreGuestLaunch, type GameReview, type GameSource } from "@/lib/community";
import { games } from "@/lib/games";
import { OfficialPlayLink } from "./official-play-link";
export { OfficialPlayLink } from "./official-play-link";
import "@/app/community.css";

export type ReviewSource = GameSource;
type ReviewProps = { id: string; source?: ReviewSource; ownerId?: string; published?: boolean; allowWrite?: boolean };

export function Reviews(props: ReviewProps) {
  const { user } = useAuth();
  return <ReviewPanel key={`${props.source}:${props.id}:${user?.uid ?? "guest"}`} {...props} />;
}

function ReviewPanel({ id, source = "communityGames", ownerId, published = true, allowWrite = false }: ReviewProps) {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const editor = useRef<HTMLTextAreaElement>(null);
  const action = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      return onSnapshot(collection(getFirebase().db, source, id, "reviews"), (snapshot) => {
        setReviews(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as GameReview));
        setLoaded(true); setLoadError("");
      }, (failure) => setLoadError(accountError(failure)));
    } catch (failure) { queueMicrotask(() => setLoadError(accountError(failure))); }
  }, [id, source, attempt]);

  useEffect(() => {
    if (!user || !allowWrite || !published || user.uid === ownerId) return;
    let active = true;
    let stop: (() => void) | undefined;
    try {
      stop = onSnapshot(doc(getFirebase().db, source, id, "players", user.uid), (snapshot) => setEligible(snapshot.exists()), (failure) => setError(accountError(failure)));
      void restoreGuestLaunch(id, user.uid, source).catch((failure) => { if (active) setError(accountError(failure)); });
    } catch (failure) { queueMicrotask(() => { if (active) setError(accountError(failure)); }); }
    return () => { active = false; stop?.(); };
  }, [id, source, user, ownerId, allowWrite, published, attempt]);

  useEffect(() => {
    const opened = (event: Event) => {
      const detail = (event as CustomEvent<{ gameId: string; source: GameSource }>).detail;
      if (detail.gameId === id && detail.source === source) setPrompt(true);
    };
    window.addEventListener("vihar:game-opened", opened);
    return () => window.removeEventListener("vihar:game-opened", opened);
  }, [id, source]);
  useEffect(() => { if (editing) editor.current?.focus(); }, [editing]);

  const mine = reviews.find((review) => review.id === user?.uid);
  const canWrite = allowWrite && published && (!user || user.uid !== ownerId);
  const path = source === "officialGames" ? `/games/${id}` : `/community/${id}`;
  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => action.current?.focus());
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy || !eligible) return;
    const data = new FormData(event.currentTarget);
    const text = String(data.get("text")).trim();
    if (!text) { setError("Write a review before saving."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await setDoc(doc(getFirebase().db, source, id, "reviews", user.uid), {
        rating: Number(data.get("rating")), text, updatedAt: serverTimestamp(),
      });
      setMessage(mine ? "Your review has been updated. Thanks for sharing!" : "Your review is published. Thanks for playing!");
      setPrompt(false); closeEditor();
    } catch (failure) { setError(accountError(failure)); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!user || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await deleteDoc(doc(getFirebase().db, source, id, "reviews", user.uid));
      setMessage("Review deleted."); closeEditor();
    } catch (failure) { setError(accountError(failure)); }
    finally { setBusy(false); }
  }

  return <section ref={section} className="community-reviews" id={`reviews-${id}`} aria-labelledby={`reviews-title-${id}`}>
    <div className="review-heading"><div><p className="eyebrow"><MessageSquare size={15} aria-hidden="true" />The player perspective</p><h2 id={`reviews-title-${id}`}>Ratings & reviews</h2><p>Played a round? Tell us what you loved and what could be better.</p></div><Star className="review-heading-star" size={42} aria-hidden="true" /></div>
    {loadError ? <p role="alert">Reviews are unavailable right now. <button className="text-link" onClick={() => setAttempt((value) => value + 1)}>Try again</button></p> : !loaded ? <p role="status">Loading reviews…</p> : <>
      <div className="review-overview">
        <div><strong className="review-score">{reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "—"}</strong><p>out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div>
        <div className="rating-distribution">{[5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.filter((review) => review.rating === rating).length;
          const total = Math.max(reviews.length, 1);
          return <div key={rating}>
            <span>{rating} ★</span>
            <span className="rating-meter" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-valuetext={`${count} of ${reviews.length} reviews`} aria-label={`${rating} star reviews`}>
              <span className="rating-meter-fill" aria-hidden="true" style={{ width: `${count / total * 100}%` }} />
            </span>
            <span>{count}</span>
          </div>;
        })}</div>
      </div>
      {canWrite && <div className="review-invitation"><div><h3>{mine ? "Thanks for sharing your experience." : prompt ? "How was your game?" : "Your next move? Leave a review."}</h3><p>{mine ? "Your review helps other players choose their next game." : "A quick, honest review helps players and makes the next update better."}</p></div>{authLoading ? <p role="status">Checking sign-in…</p> : !user ? <Link className="button button-dark" href={`/login?next=${encodeURIComponent(path)}`}>Sign in to review</Link> : <button ref={action} type="button" className="button button-dark" disabled={busy || editing} onClick={() => { setError(""); setMessage(""); setEditing(true); }}>{mine ? "Edit your review" : "Write a review"}</button>}</div>}
      {canWrite && user && editing && <form className="community-form review-editor" onSubmit={save} aria-label={mine ? "Edit your review" : "Write a review"}>
        <h3>{mine ? "Edit your review" : "How was your game?"}</h3>
        {!eligible && <p className="review-play-note">Open the game with the play button on this page first, then come back to post your review.</p>}
        <fieldset className="rating-picker"><legend>Your rating</legend>{[1, 2, 3, 4, 5].map((rating) => <label key={rating}><input type="radio" name="rating" value={rating} defaultChecked={rating === (mine?.rating ?? 5)} required disabled={busy} /><span>{rating} ★</span></label>)}</fieldset>
        <label>Your review<textarea ref={editor} name="text" required maxLength={1000} rows={4} defaultValue={mine?.text ?? ""} disabled={busy} placeholder="What did you enjoy? What could be better?" /></label>
        <div className="review-editor-actions"><button className="button button-dark" disabled={busy || !eligible}>{busy ? "Saving…" : mine ? "Update review" : "Post review"}</button><button type="button" className="button button-outline" disabled={busy} onClick={() => { setError(""); closeEditor(); }}>Cancel</button>{mine && <button className="review-delete" type="button" disabled={busy} onClick={() => void remove()}>Delete my review</button>}</div>
      </form>}
      {!reviews.length && <p className="review-empty">No reviews yet. Yours could start the conversation.</p>}
      <div className="review-list">{[...reviews].sort((a, b) => Number(b.id === user?.uid) - Number(a.id === user?.uid)).map((review) => <blockquote key={review.id} className={review.id === user?.uid ? "review-mine" : undefined}><strong><span aria-hidden="true">{"★".repeat(review.rating)}</span><span className="sr-only">{review.rating} out of 5</span> · {review.id === user?.uid ? "Your review" : "Player"}</strong><p>{review.text}</p></blockquote>)}</div>
    </>}
    {error && <p role="alert" className="account-error">{error}</p>}
    <p className="review-success" role="status">{message}</p>
    {prompt && !mine && canWrite && !editing && <aside className="review-return-prompt" aria-label="Review invitation"><div><strong>Played a round?</strong><p>Share your experience with other players.</p></div><button type="button" className="button button-dark" onClick={() => { setPrompt(false); section.current?.scrollIntoView({ behavior: "instant", block: "start" }); if (user) setEditing(true); }}>Leave a review</button><button type="button" className="review-prompt-dismiss" aria-label="Dismiss review reminder" onClick={() => setPrompt(false)}>×</button></aside>}
  </section>;
}

export function OfficialGameReviews({ id }: { id: string }) {
  const game = games.find((item) => item.slug === id);
  if (!game) return null;
  if (game.status !== "playable") return <section className="community-reviews"><h2>Ratings & reviews</h2><p>Player reviews open when this game is released.</p></section>;
  return <><OfficialPlayLink id={id} className="button button-dark">Play & come back to review ↗</OfficialPlayLink><Reviews id={id} source="officialGames" allowWrite /></>;
}
