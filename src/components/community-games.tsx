"use client";

import { useEffect, useState } from "react";
import { average, collection, count, doc, getAggregateFromServer, getCountFromServer, limit, onSnapshot, query, where } from "firebase/firestore";
import { ArrowUpRight, Search, UsersRound } from "lucide-react";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { accountError } from "@/lib/account/model";
import { gameUrl, recordLaunch, type CommunityGame } from "@/lib/community";
import "@/app/community.css";
import "@/app/discovery.css";
import { GameArtwork, GameEditor } from "./game-editor";
import { Reviews } from "./game-reviews";
import { RatingBadge } from "./rating-badge";
import { GameOrigin } from "./game-origin";
import { CommunityCreator } from "./community-creator";

function Failure({ message }: { message: string }) { return message ? <p role="alert" className="account-error">{message}</p> : null; }

export function CommunityGames({ creator = false, analytics = false, preview = false, byCreator, initialGames }: { creator?: boolean; analytics?: boolean; preview?: boolean; byCreator?: string; initialGames?: CommunityGame[] }) {
  const { user } = useAuth();
  const [games, setGames] = useState<CommunityGame[]>(() => preview ? initialGames?.slice(0, 3) ?? [] : initialGames ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialGames === undefined);
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (creator && !user) return;
    try {
      return onSnapshot(query(collection(getFirebase().db, "communityGames"), where(creator ? "ownerId" : "published", "==", creator ? user!.uid : true), ...(!creator && byCreator ? [where("ownerId", "==", byCreator)] : []), ...(!creator && preview ? [limit(3)] : [])), (snapshot) => {
        setGames(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as CommunityGame)); setLoading(false); setError("");
      }, (failure) => { setError(accountError(failure)); setLoading(false); });
    } catch (failure) { queueMicrotask(() => { setError(accountError(failure)); setLoading(false); }); }
  }, [creator, user, preview, byCreator, attempt]);
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = games.filter((game) => terms.every((term) => [game.title, game.description, game.genre, game.kind].join(" ").toLowerCase().includes(term)));
  return <section className={`community-section${creator ? "" : " community-discovery"}`} aria-labelledby="community-title">
    <div className="community-heading">
      <div><GameOrigin source="communityGames" /><h2 id="community-title">{creator ? analytics ? "Performance & player feedback" : "Your game library" : byCreator ? "Games from this creator" : "Community Games"}</h2><p>{creator ? "Your games, published under your player profile." : byCreator ? "Explore their published games, play a round, and share your feedback." : "Discover independent games. Meet their creators. Play, review, and help shape what comes next."}</p></div>
      {!creator && <Link className="text-link" href={preview || byCreator ? "/games/community" : "/dashboard/publish"}>{preview || byCreator ? "Explore community games" : "Share your game"} <ArrowUpRight size={17} aria-hidden="true" /></Link>}
    </div>
    {!creator && !preview && !byCreator && <div className="community-search"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="community-search">Search Community Games</label><input id="community-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search community games by name or genre…" /></div>}
    {loading ? <p role="status">Loading {creator ? "your" : "community"} games…</p> : error ? <div className="community-empty"><p role="alert">{creator ? error : "Community games couldn’t load. Please try again."}</p><button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(""); setAttempt((value) => value + 1); }}>Try again</button></div> : !games.length ? <div className="community-empty"><UsersRound size={28} aria-hidden="true" /><h3>{creator ? "Your first game starts here." : byCreator ? "No published games yet." : "A space for your game."}</h3><p>{creator ? "Choose Create game to add your first listing." : byCreator ? "This player hasn’t published a community game yet." : "No community games have been published yet. Share a game and give players a new world to discover."}</p>{!creator && !byCreator && <Link className="button button-dark" href="/dashboard/publish">Share the first community game <ArrowUpRight size={16} aria-hidden="true" /></Link>}</div> : <>
      {!creator && !preview && <p className="community-results" role="status">{visible.length} {visible.length === 1 ? "community game" : "community games"}{search ? " found" : " to explore"}</p>}
      {!visible.length ? <div className="community-empty"><h3>No community games match.</h3><p>Try another name or genre.</p><button type="button" className="button button-outline" onClick={() => setSearch("")}>Clear community search</button></div> : <div className="community-grid">{visible.map((game) => creator ? <CreatorCard key={game.id} game={game} analytics={analytics} /> : <CommunityGameCard key={game.id} game={game} />)}</div>}
    </>}
  </section>;
}

function CommunityGameCard({ game }: { game: CommunityGame }) {
  return <article className="community-card community-discovery-card">
    <Link className="community-thumbnail" href={`/community/${game.id}`} aria-label={`Discover ${game.title}`}><GameArtwork key={game.coverUrl} src={game.coverUrl} title={game.title} /><RatingBadge id={game.id} /></Link>
    <div className="community-card-copy"><GameOrigin source="communityGames" /><h3><Link href={`/community/${game.id}`}>{game.title}</Link></h3><CommunityCreator ownerId={game.ownerId} /><span className="eyebrow">{game.kind === "download" ? "Downloadable game" : "Browser game"}{game.genre ? ` · ${game.genre}` : ""}</span><p className="community-card-description">{game.description}</p><Link className="text-link" href={`/community/${game.id}`}>Play & read reviews <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
  </article>;
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

export function CommunityGamePage({ id, initialGame = null, initialCreator }: { id: string; initialGame?: CommunityGame | null; initialCreator?: { displayName: string; username: string } | null }) {
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
    try { if (user.uid !== game.ownerId) await recordLaunch(id, user.uid); }
    catch { setError("Your game opened, but the activity could not be saved. Try opening it again to enable reviews."); } finally { setBusy(false); }
  }
  if (authError) return <Failure message={authError} />;
  if (!ready) return <p role="status">Loading game…</p>;
  if (!game) return <p role="alert">{error || "Game not found."}</p>;
  return <article className="community-section"><Link href="/games/community">← Community Games</Link><div className="community-detail-origin"><GameOrigin source="communityGames" />{!game.published && <span>Draft preview · Only you can see this listing</span>}</div><h1>{game.title}</h1><CommunityCreator key={game.ownerId} ownerId={game.ownerId} initialProfile={initialCreator} /><div className="community-detail-cover"><GameArtwork key={game.coverUrl} src={game.coverUrl} title={game.title} /><RatingBadge id={game.id} /></div><p className="eyebrow">{game.genre}</p><p className="community-description">{game.description}</p><p>This game is shared by a community member and hosted at <strong>{new URL(game.url).hostname}</strong>. {game.kind === "download" ? "The download page opens in a new tab. Check the creator’s system requirements before downloading." : "Playing opens their website in a new tab. Come back here to review your experience."}</p>{user ? game.published ? <a className="button button-dark" href={gameUrl(game.url)} target="_blank" rel="noopener noreferrer" onClick={() => { if (!busy) void launch(); }} onAuxClick={(event) => { if (event.button === 1 && !busy) void launch(); }}>{game.kind === "download" ? "Visit download page ↗" : "Play game ↗"}<span className="sr-only"> — opens in a new tab</span></a> : <button className="button button-dark" disabled>Publish to enable play</button> : <Link className="button button-dark" href={`/login?next=${encodeURIComponent(`/community/${id}`)}`}>Sign in to play & review</Link>}<Link className="text-link community-feedback-link" href={`#reviews-${id}`}>Ratings, reviews & feedback ↓</Link><Failure message={error} />{game.screenshots && game.screenshots.length > 0 && <section><h2>Inside the game</h2><div className="game-screenshots">{game.screenshots.map((url, index) => <GameArtwork key={`${url}-${index}`} src={url} title={`${game.title} screenshot ${index + 1}`} />)}</div></section>}{game.howToPlay && <section className="game-guide"><h2>How to play</h2><p className="community-description">{game.howToPlay}</p></section>}{game.controls && <section className="game-guide"><h2>Controls</h2><p className="community-description">{game.controls}</p></section>}{game.requirements && <section className="game-guide"><h2>Devices & requirements</h2><p className="community-description">{game.requirements}</p></section>}<Reviews id={game.id} ownerId={game.ownerId} published={game.published} allowWrite /></article>;
}
