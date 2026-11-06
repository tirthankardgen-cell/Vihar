"use client";

import { OfficialPlayLink } from "@/components/game-reviews";
import { RatingBadge } from "@/components/rating-badge";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Clock3, Gamepad2, Heart, LockKeyhole, Play, Sparkles, Trophy, Users } from "lucide-react";
import Link from "@/components/site-link";
import { games } from "@/lib/games";
import { accountError, playTime, type GameStats } from "@/lib/account/model";
import { setFavorite } from "@/lib/account/data";
import { useAuth } from "./auth-provider";
import { useAccountData } from "./account-shell";
import { ViharIdCard } from "./vihar-id-card";
import { ShareProfile } from "./share-profile";
import { PlayActivity } from "./play-activity";

export function StatTiles({ stats, loading = false }: { stats: GameStats[]; loading?: boolean }) {
  const sessions = stats.reduce((sum, game) => sum + (game.sessions || 0), 0);
  const seconds = stats.reduce((sum, game) => sum + (game.playSeconds || 0), 0);
  const items = [{ label: "Games played", value: stats.filter((game) => game.sessions > 0).length, Icon: Gamepad2 }, { label: "Time well spent", value: playTime(seconds), Icon: Clock3 }, { label: "Play sessions", value: sessions, Icon: Play }];
  return <div className="account-stat-grid">{items.map(({ label, value, Icon }) => <div className="account-stat" key={label}><div><span>{label}</span><Icon size={18} aria-hidden="true" /></div><strong>{loading ? "—" : value}</strong><span>{loading ? "Loading your stats" : "Across connected games"}</span></div>)}</div>;
}
export function AccountGames({ favoritesOnly = false, compact = false }: { favoritesOnly?: boolean; compact?: boolean }) {
  const { user } = useAuth();
  const { favorites, loading } = useAccountData();
  const [pending, setPending] = useState<string[]>([]), [error, setError] = useState("");
  const visible = games.filter((game) => !favoritesOnly || favorites.includes(game.slug));
  async function favorite(game: string) {
    if (!user) return;
    setPending((value) => [...value, game]); setError("");
    try { await setFavorite(user.uid, game, !favorites.includes(game)); }
    catch (failure) { setError(accountError(failure)); }
    finally { setPending((value) => value.filter((id) => id !== game)); }
  }
  if (favoritesOnly && loading) return <p className="account-muted" role="status">Finding your saved games…</p>;
  return <>{error && <p className="account-error" role="alert">{error}</p>}{!visible.length && <div className="account-empty"><Heart size={30} aria-hidden="true" /><h2>A place for your favourites.</h2><p>Tap the heart on any game below to keep it close.</p></div>}<div className={`account-game-grid ${compact ? "compact" : ""}`}>{visible.map((game) => <article key={game.slug} className="account-game-card"><div className="account-game-art"><Image src={game.artwork} alt={game.artworkAlt} fill sizes="(max-width: 767px) 90vw, 430px" /><span className={`status-badge ${game.status === "playable" ? "status-available" : "status-upcoming"}`}>{game.status === "playable" ? "Playable now" : "Coming soon"}</span><button type="button" className="favorite-button" aria-label={`${favorites.includes(game.slug) ? "Unsave" : "Save"} ${game.title}`} aria-pressed={favorites.includes(game.slug)} disabled={pending.includes(game.slug) || loading} onClick={() => void favorite(game.slug)}><Heart size={18} fill={favorites.includes(game.slug) ? "currentColor" : "none"} aria-hidden="true" /></button><RatingBadge id={game.slug} source="officialGames" upcoming={game.status !== "playable"} /><span className="account-art-caption">{game.artworkLabel}</span></div><div className="account-game-copy"><p className="eyebrow">{game.genre}</p><h3>{game.title}</h3><p>{game.description}</p><div className="account-game-bottom">{game.status === "playable" ? <OfficialPlayLink id={game.slug} className="button button-dark">Play now <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> — opens in a new tab</span></OfficialPlayLink> : <Link className="button button-outline" href={`/games/${game.slug}`}>Meet the game <ArrowRight size={16} aria-hidden="true" /></Link>}<span>{game.status === "playable" ? "Stats connection coming later" : "A new world in the making"}</span></div></div></article>)}</div></>;
}
export function Dashboard() {
  const { profile } = useAuth();
  const { stats, friendships, loading } = useAccountData();
  if (!profile) return null;
  const friends = friendships.filter((item) => item.status === "accepted");
  const sessions = stats.reduce((sum, game) => sum + (game.sessions || 0), 0);
  const recent = [...stats].filter((game) => game.sessions > 0).sort((a, b) => (b.lastPlayedAt?.toMillis() || 0) - (a.lastPlayedAt?.toMillis() || 0));
  return <><div className="dashboard-heading"><div><p className="eyebrow">Your space to play</p><h1>Hello, <em>{profile.displayName}.</em></h1><p className="account-muted">Your profile, games and connections. All together.</p></div><ShareProfile username={profile.username} version={profile.updatedAt?.toMillis() || 0} /></div>
    <section className="dashboard-welcome"><div className="dashboard-welcome-copy"><p className="eyebrow"><span aria-hidden="true">✳</span> Your player hub</p><h2>Your games.<br /><em>Your identity.</em></h2><p>Your games, your people, your next adventure.</p><Link href="/dashboard/games" className="text-link">Find your next game <ArrowUpRight size={17} aria-hidden="true" /></Link><Link href={`/u/${profile.username}`} className="text-link">View your public profile <ArrowUpRight size={17} aria-hidden="true" /></Link></div><ViharIdCard profile={profile} /></section>
    <section aria-label="Your game statistics"><StatTiles stats={stats} loading={loading} /><p className="stats-note">Your stats will appear as games connect to Vihar ID. Current games can still be played as a guest.</p></section>
    <PlayActivity />
    <section className="dashboard-section" aria-labelledby="next-adventure"><div className="account-section-heading"><h2 id="next-adventure">Ready to play?</h2><Link href="/dashboard/games" className="text-link">All games <ArrowRight size={15} aria-hidden="true" /></Link></div><AccountGames compact /></section>
    <div className="dashboard-two-column"><section className="account-panel" aria-labelledby="activity-title"><div className="account-section-heading"><h2 id="activity-title">Recent activity</h2><Clock3 size={18} aria-hidden="true" /></div>{recent.length ? <ul className="activity-list">{recent.map((game) => <li key={game.gameId}><Gamepad2 size={20} aria-hidden="true" /><div><strong>{games.find((item) => item.slug === game.gameId)?.title || game.gameId}</strong><span>{game.sessions} sessions · {playTime(game.playSeconds)}</span></div></li>)}</ul> : <div className="activity-empty"><span aria-hidden="true">↝</span><h3>Your next session starts here.</h3><p>Recent sessions will appear here when you play a connected game.</p></div>}</section><section className="account-panel" aria-labelledby="milestones-title"><div className="account-section-heading"><h2 id="milestones-title">Milestones</h2><Trophy size={18} aria-hidden="true" /></div><div className="milestone"><span className="milestone-icon"><Sparkles size={20} aria-hidden="true" /></span><div><strong>Profile created</strong><p>Your player identity is ready.</p></div><Check size={17} aria-label="Unlocked" /></div><div className={`milestone ${sessions ? "" : "milestone-locked"}`}><span className="milestone-icon"><Gamepad2 size={20} aria-hidden="true" /></span><div><strong>First session</strong><p>Play your first connected game.</p></div>{sessions ? <Check size={17} aria-label="Unlocked" /> : <LockKeyhole size={15} aria-label="Locked" />}</div><Link href="/dashboard/friends" className="dashboard-friends-link"><Users size={18} aria-hidden="true" /><span>{friends.length ? `${friends.length} ${friends.length === 1 ? "friend" : "friends"} to share the fun` : "Good company makes it better"}</span><ArrowRight size={16} aria-hidden="true" /></Link></section></div>
  </>;
}
export function GamesDashboard() {
  return <><div className="dashboard-heading"><div><p className="eyebrow">Your collection</p><h1>Your <em>games.</em></h1><p className="account-muted">A growing collection. A place for all your favourites.</p></div></div><section className="dashboard-section"><div className="account-section-heading"><h2>Saved games</h2><Heart size={18} aria-hidden="true" /></div><AccountGames favoritesOnly /></section><section className="dashboard-section"><div className="account-section-heading"><h2>Explore the collection</h2></div><AccountGames /></section></>;
}
