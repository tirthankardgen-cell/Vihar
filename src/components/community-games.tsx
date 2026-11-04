"use client";

import { useEffect, useState } from "react";
import { average, collection, count, doc, getAggregateFromServer, getCountFromServer, onSnapshot, query, where } from "firebase/firestore";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { accountError } from "@/lib/account/model";
import { gameUrl, recordLaunch, type CommunityGame } from "@/lib/community";
import "@/app/community.css";
import { GameArtwork, GameEditor } from "./game-editor";
import { Reviews } from "./game-reviews";
import { RatingBadge } from "./rating-badge";

function Failure({ message }: { message: string }) { return message ? <p role="alert" className="account-error">{message}</p> : null; }

export function CommunityGames({ creator = false, analytics = false }: { creator?: boolean; analytics?: boolean }) {
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
  return <section className="community-section"><div className="community-heading"><div><p className="eyebrow">Made by the community</p><h2>{creator ? analytics ? "Performance & player feedback" : "Your game library" : "Discover independent games"}</h2></div>{!creator && <Link className="button button-dark" href="/dashboard/publish">Share your game</Link>}</div><Failure message={error} />{loading ? <p role="status">Loading games…</p> : !error && games.length === 0 ? <p>{creator ? "Your first game starts here. Choose Create game to add your first listing." : "Be the first to share a game with the community."}</p> : null}<div className="community-grid">{games.map((game) => creator ? <CreatorCard key={game.id} game={game} analytics={analytics} /> : <article className="community-card" key={game.id}><Link className="community-thumbnail" href={`/community/${game.id}`}><GameArtwork key={game.coverUrl} src={game.coverUrl} title={game.title} /><RatingBadge id={game.id} /></Link><span className="eyebrow">{game.kind === "download" ? "Downloadable game" : "Browser game"} · externally hosted</span><h3>{game.title}</h3><p>{game.description}</p><Link className="text-link" href={`/community/${game.id}`}>Play & read reviews →</Link></article>)}</div></section>;
}

export function PublishGame() {
  const [tab, setTab] = useState<"create" | "content" | "analytics">("create");
  return <div className="community-section creator-studio"><p className="eyebrow">Creator studio</p><h1>Your games. Their next adventure.</h1><p>Create a beautiful game page, share it with players, and see what they think.</p><nav className="studio-tabs" aria-label="Creator studio">{([['create', 'Create game'], ['content', 'Content'], ['analytics', 'Analytics']] as const).map(([value, label]) => <button key={value} type="button" aria-current={tab === value ? "page" : undefined} onClick={() => setTab(value)}>{label}</button>)}</nav><div hidden={tab !== "create"}><GameEditor /></div>{tab !== "create" && <CommunityGames key={tab} creator analytics={tab === "analytics"} />}</div>;
}

function CreatorCard({ game, analytics = false }: { game: CommunityGame; analytics?: boolean }) {
  const [players, setPlayers] = useState<number | null>(null), [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<{ rating: number | null; count: number } | null>(null);
  async function refresh() {
    try {
      const db = getFirebase().db;
      const [opens, ratings] = await Promise.all([getCountFromServer(collection(db, "communityGames", game.id, "players")), getAggregateFromServer(collection(db, "communityGames", game.id, "reviews"), { rating: average("rating"), count: count() })]);
      setPlayers(opens.data().count); setStats(ratings.data()); setError("");
    } catch (failure) { setError(accountError(failure)); }
  }
  useEffect(() => {
    let active = true;
    try {
      const db = getFirebase().db;
      void Promise.all([getCountFromServer(collection(db, "communityGames", game.id, "players")), getAggregateFromServer(collection(db, "communityGames", game.id, "reviews"), { rating: average("rating"), count: count() })]).then(([opens, ratings]) => { if (active) { setPlayers(opens.data().count); setStats(ratings.data()); } }).catch((failure) => { if (active) setError(accountError(failure)); });
    } catch (failure) { queueMicrotask(() => { if (active) setError(accountError(failure)); }); }
    return () => { active = false; };
  }, [game.id]);
  return <article className={`community-card creator-card ${editing ? "creator-card-editing" : ""}`}><div className="creator-card-title"><GameArtwork key={game.coverUrl} src={game.coverUrl} title={game.title} /><div><span className="eyebrow">{game.published ? "Published" : "Private draft"}</span><h3>{game.title}</h3><p>{game.genre || (game.kind === "browser" ? "Browser game" : "Downloadable game")}</p></div></div><div className="studio-metrics"><div><span>Unique game opens</span><strong>{players ?? "—"}</strong></div><div><span>Average rating</span><strong>{stats?.rating?.toFixed(1) ?? "—"}<small> / 5</small></strong></div><div><span>Player reviews</span><strong>{stats?.count ?? "—"}</strong></div></div><p className="community-note">Lifetime unique signed-in players opening your game from Vihar. Excludes your own launches; does not measure in-game activity.</p><div className="community-actions"><button type="button" onClick={() => void refresh()}>Refresh stats</button><button type="button" onClick={() => setEditing(!editing)}>{editing ? "Close editor" : "Edit listing"}</button><Link href={`/community/${game.id}`}>View game →</Link></div>{editing && <GameEditor game={game} onSaved={() => setEditing(false)} />}<Failure message={error} />{analytics && <Reviews id={game.id} ownerId={game.ownerId} published={game.published} />}</article>;
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
  return <article className="community-section"><Link href="/games">← All games</Link><p className="eyebrow">Community game · {game.published ? "Self-hosted" : "Draft preview"}</p><h1>{game.title}</h1><div className="community-detail-cover"><GameArtwork key={game.coverUrl} src={game.coverUrl} title={game.title} /><RatingBadge id={game.id} /></div><p className="eyebrow">{game.genre}</p><p className="community-description">{game.description}</p><p>Hosted by its creator at <strong>{new URL(game.url).hostname}</strong>. {game.kind === "download" ? "The download page opens on their website. Check the creator’s system requirements before downloading." : "Playing takes you to their website."}</p>{user ? <button className="button button-dark" disabled={busy || !game.published} onClick={() => void launch()}>{busy ? "Opening…" : game.kind === "download" ? "Visit download page ↗" : "Play game ↗"}</button> : <Link className="button button-dark" href={`/login?next=${encodeURIComponent(`/community/${id}`)}`}>Sign in to play & review</Link>}<Failure message={error} />{game.screenshots && game.screenshots.length > 0 && <section><h2>Inside the game</h2><div className="game-screenshots">{game.screenshots.map((url, index) => <GameArtwork key={`${url}-${index}`} src={url} title={`${game.title} screenshot ${index + 1}`} />)}</div></section>}{game.howToPlay && <section className="game-guide"><h2>How to play</h2><p className="community-description">{game.howToPlay}</p></section>}{game.controls && <section className="game-guide"><h2>Controls</h2><p className="community-description">{game.controls}</p></section>}{game.requirements && <section className="game-guide"><h2>Devices & requirements</h2><p className="community-description">{game.requirements}</p></section>}<Reviews id={game.id} ownerId={game.ownerId} published={game.published} allowWrite /></article>;
}
