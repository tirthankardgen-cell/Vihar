"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getCountFromServer, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { accountError } from "@/lib/account/model";
import { gameUrl, recordLaunch, type CommunityGame, type GameReview } from "@/lib/community";
import "@/app/community.css";

function Failure({ message }: { message: string }) { return message ? <p role="alert" className="account-error">{message}</p> : null; }

export function CommunityGames({ creator = false }: { creator?: boolean }) {
  const { user } = useAuth();
  const [games, setGames] = useState<CommunityGame[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (creator && !user) return;
    try {
      return onSnapshot(query(collection(getFirebase().db, "communityGames"), where(creator ? "ownerId" : "published", "==", creator ? user!.uid : true)), (snapshot) => {
        setGames(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as CommunityGame)); setLoading(false); setError("");
      }, (failure) => { setError(accountError(failure)); setLoading(false); });
    } catch (failure) { queueMicrotask(() => { setError(accountError(failure)); setLoading(false); }); }
  }, [creator, user]);
  return <section className="community-section"><div className="community-heading"><div><p className="eyebrow">Made by the community</p><h2>{creator ? "Your published worlds" : "Discover independent games"}</h2></div>{!creator && <Link className="button button-dark" href="/dashboard/publish">Share your game</Link>}</div><Failure message={error} />{loading ? <p role="status">Loading games…</p> : !error && games.length === 0 ? <p>{creator ? "Your first game starts here. Add its link above." : "Be the first to share a game with the community."}</p> : null}<div className="community-grid">{games.map((game) => creator ? <CreatorCard key={game.id} game={game} /> : <article className="community-card" key={game.id}><span className="eyebrow">{game.kind === "download" ? "Downloadable game" : "Browser game"} · externally hosted</span><h3>{game.title}</h3><p>{game.description}</p><Link className="text-link" href={`/community/${game.id}`}>Play & read reviews →</Link></article>)}</div></section>;
}

export function PublishGame() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user || busy) return;
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setError(""); setMessage("");
    try {
      const title = String(data.get("title")).trim(), description = String(data.get("description")).trim();
      if (!title || !description) throw new Error("Add a title and description.");
      await addDoc(collection(getFirebase().db, "communityGames"), { ownerId: user.uid, title, description, url: gameUrl(String(data.get("url"))), kind: String(data.get("kind")), published: data.get("published") === "on", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      form.reset(); setMessage("Game saved. Manage your listing and see its stats below.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : accountError(failure)); } finally { setBusy(false); }
  }
  return <div className="community-section"><p className="eyebrow">Creator studio</p><h1>Give your game a home on Vihar.</h1><p>Share your self-hosted browser or downloadable game, reach new players, and learn from their reviews. Your game stays on your own hosting.</p><form className="community-form" onSubmit={submit}><label>Game title<input name="title" required maxLength={80} /></label><label>Public game URL<input name="url" type="url" placeholder="https://your-game.com/" required maxLength={2048} /></label><label>Game type<select name="kind"><option value="browser">Browser game</option><option value="download">Downloadable game</option></select></label><label>Description<textarea name="description" required maxLength={2000} rows={4} /></label><label className="community-check"><input type="checkbox" name="published" /> Publish now (leave unchecked to save a draft)</label><label className="community-check"><input type="checkbox" required /> I own this game or have permission to share it.</label><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save game"}</button><Failure message={error} /><p role="status">{message}</p></form><CommunityGames creator /></div>;
}

function CreatorCard({ game }: { game: CommunityGame }) {
  const [players, setPlayers] = useState<number | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  async function refresh() {
    try { setPlayers((await getCountFromServer(collection(getFirebase().db, "communityGames", game.id, "players"))).data().count); setError(""); }
    catch (failure) { setError(accountError(failure)); }
  }
  useEffect(() => {
    let active = true;
    void getCountFromServer(collection(getFirebase().db, "communityGames", game.id, "players")).then((snapshot) => { if (active) setPlayers(snapshot.data().count); }).catch((failure) => { if (active) setError(accountError(failure)); });
    return () => { active = false; };
  }, [game.id]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setError("");
    try {
      const title = String(data.get("title")).trim(), description = String(data.get("description")).trim();
      if (!title || !description) throw new Error("Add a title and description.");
      await updateDoc(doc(getFirebase().db, "communityGames", game.id), { title, description, url: gameUrl(String(data.get("url"))), kind: String(data.get("kind")), published: data.get("published") === "on", updatedAt: serverTimestamp() }); setEditing(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : accountError(failure)); } finally { setBusy(false); }
  }
  return <article className="community-card"><span className="eyebrow">{game.published ? "Published" : "Draft"}</span><h3>{game.title}</h3><p><strong>{players ?? "—"}</strong> unique signed-in players opened this game</p><p className="community-note">Counts game or download-page opens from Vihar, not live players, completed downloads or in-game activity. Your own launches are excluded.</p><div className="community-actions"><button type="button" onClick={() => void refresh()}>Refresh stats</button><button type="button" onClick={() => setEditing(!editing)}>{editing ? "Cancel edit" : "Edit listing"}</button><Link href={`/community/${game.id}`}>View game</Link></div>{editing && <form className="community-form" onSubmit={save}><label>Title<input name="title" defaultValue={game.title} maxLength={80} required /></label><label>Game URL<input name="url" type="url" defaultValue={game.url} maxLength={2048} required /></label><label>Game type<select name="kind" defaultValue={game.kind}><option value="browser">Browser game</option><option value="download">Downloadable game</option></select></label><label>Description<textarea name="description" defaultValue={game.description} maxLength={2000} required /></label><label className="community-check"><input name="published" type="checkbox" defaultChecked={game.published} /> Published</label><button className="button button-dark" disabled={busy}>Save changes</button></form>}<Failure message={error} /><Reviews game={game} /></article>;
}

export function CommunityGamePage({ id, initialGame = null }: { id: string; initialGame?: CommunityGame | null }) {
  const { user, loading, error: authError } = useAuth();
  const [game, setGame] = useState<CommunityGame | null>(initialGame), [error, setError] = useState(""), [ready, setReady] = useState(!!initialGame), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (loading) return;
    try { return onSnapshot(doc(getFirebase().db, "communityGames", id), (snapshot) => { setGame(snapshot.exists() ? { ...snapshot.data(), id } as CommunityGame : null); setReady(true); }, () => { setGame(null); setError("This game is unavailable or unpublished."); setReady(true); }); }
    catch (failure) { queueMicrotask(() => { setError(accountError(failure)); setReady(true); }); }
  }, [id, loading, user]);
  async function launch() {
    if (!user || !game) return;
    setBusy(true); setError("");
    try { if (user.uid !== game.ownerId) await recordLaunch(id, user.uid); window.location.assign(gameUrl(game.url)); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  if (authError) return <Failure message={authError} />;
  if (!ready) return <p role="status">Loading game…</p>;
  if (!game) return <p role="alert">{error || "Game not found."}</p>;
  return <article className="community-section"><Link href="/games">← All games</Link><p className="eyebrow">Community game · {game.published ? "Self-hosted" : "Draft preview"}</p><h1>{game.title}</h1><p className="community-description">{game.description}</p><p>Hosted by its creator at <strong>{new URL(game.url).hostname}</strong>. {game.kind === "download" ? "The download page opens on their website. Check the creator’s system requirements before downloading." : "Playing takes you to their website."}</p>{user ? <button className="button button-dark" disabled={busy || !game.published} onClick={() => void launch()}>{busy ? "Opening…" : game.kind === "download" ? "Visit download page ↗" : "Play game ↗"}</button> : <Link className="button button-dark" href={`/login?next=${encodeURIComponent(`/community/${id}`)}`}>Sign in to play & review</Link>}<Failure message={error} /><Reviews game={game} allowWrite /></article>;
}

function Reviews({ game, allowWrite = false }: { game: CommunityGame; allowWrite?: boolean }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]), [error, setError] = useState(""), [loaded, setLoaded] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  useEffect(() => {
    try { return onSnapshot(collection(getFirebase().db, "communityGames", game.id, "reviews"), (snapshot) => { setReviews(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as GameReview)); setLoaded(true); }, (failure) => setError(accountError(failure))); }
    catch (failure) { queueMicrotask(() => setError(accountError(failure))); }
  }, [game.id]);
  const mine = reviews.find((review) => review.id === user?.uid);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user) return;
    const data = new FormData(event.currentTarget); setBusy(true); setError(""); setMessage("");
    try { const text = String(data.get("text")).trim(); if (!text) throw new Error("Write a review before saving."); await setDoc(doc(getFirebase().db, "communityGames", game.id, "reviews", user.uid), { rating: Number(data.get("rating")), text, updatedAt: serverTimestamp() }); setMessage("Your review is saved."); }
    catch { setError("Could not save your review. Launch the game from Vihar first, then try again."); } finally { setBusy(false); }
  }
  async function remove() {
    if (!user) return; setBusy(true); setError("");
    try { await deleteDoc(doc(getFirebase().db, "communityGames", game.id, "reviews", user.uid)); setMessage("Review deleted."); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  return <section className="community-reviews"><h3>Player reviews</h3>{!loaded && !error ? <p role="status">Loading reviews…</p> : <p>{reviews.length ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} / 5 · ${reviews.length} reviews` : "No reviews yet."}</p>}{reviews.map((review) => <blockquote key={review.id}><strong>{review.rating} / 5{review.id === user?.uid ? " · Your review" : " · Player"}</strong><p>{review.text}</p></blockquote>)}{allowWrite && user && user.uid !== game.ownerId && game.published && <form key={mine ? `${user.uid}-${mine.rating}-${mine.text}` : user.uid} className="community-form" onSubmit={save}><p>After playing, share your experience. You can update your review anytime.</p><label>Rating<select name="rating" defaultValue={mine?.rating ?? 5}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label><label>Your review<textarea name="text" required maxLength={1000} defaultValue={mine?.text ?? ""} /></label><button className="button button-dark" disabled={busy}>{mine ? "Update review" : "Post review"}</button>{mine && <button type="button" disabled={busy} onClick={() => void remove()}>Delete my review</button>}</form>}<Failure message={error} /><p role="status">{message}</p></section>;
}
