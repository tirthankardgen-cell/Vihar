"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "@/components/site-link";
import { getFirebase } from "@/lib/firebase/client";
import { playTime } from "@/lib/account/model";
import { useAuth } from "./auth-provider";
import { accountIdAction } from "@/lib/vihar-id/client";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import { buildPlayActivity } from "@/lib/account/activity";
import { useAccountData } from "./account-shell";

export function ConnectedGameActivity() {
  const { connectedStats: games, loading, error } = useAccountData();
  const totalMs = games.reduce((sum, game) => sum + game.playMilliseconds, 0);
  const { days } = buildPlayActivity(games.map((game) => ({ ...game, gameId: game.id, playSeconds: game.playMilliseconds / 1000 })), new Date().toISOString().slice(0, 10), 90);
  return <section className="account-panel dashboard-section"><div className="account-section-heading"><h2>Inside your games</h2><Link href="/help/play-activity">How tracking works</Link></div>{loading ? <p role="status">Loading recorded play…</p> : error ? <p role="alert">{error}</p> : <><div className="account-stat-grid"><div className="account-stat"><span>Games played</span><strong>{games.length}</strong></div><div className="account-stat"><span>Recorded play time</span><strong>{totalMs > 0 && totalMs < 60000 ? "Less than 1m" : playTime(totalMs / 1000)}</strong></div><div className="account-stat"><span>Play sessions</span><strong>{games.reduce((sum, game) => sum + game.sessions, 0)}</strong></div></div>{games.length ? <><ActivityHeatmap days={days} label="Connected game sessions over the last 90 days, in UTC" period="the last 90 days" unit={{ one: "session", other: "sessions" }} /><ul className="activity-list">{games.map((game) => <li key={game.id}><div><strong><Link href={game.source === "officialGames" ? `/games/${game.id}` : `/community/${game.id}`}>{game.title}</Link></strong><span>{game.sessions} sessions · {game.playMilliseconds < 60000 && game.playMilliseconds > 0 ? "Less than 1m" : playTime(game.playMilliseconds / 1000)} recorded · Last played {game.lastPlayedAt?.toDate().toLocaleDateString("en-IN", { timeZone: "UTC" })} UTC</span></div></li>)}</ul></> : <p>No connected sessions yet. Launch a connected game from Vihar while signed in, or sign in with Vihar ID on its website.</p>}<p className="stats-note">Time comes from recent gameplay reports, with paused and hidden time excluded by the SDK. It is an estimate, not a verified score. Creator tests, offline play, guest play and unconnected games are excluded. Game opens are listed separately below.</p></>}</section>;
}
export function GameConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<{ id: string; title: string; origin?: string; connected: boolean }[]>([]), [error, setError] = useState(""), [loading, setLoading] = useState(true), [busy, setBusy] = useState("");
  useEffect(() => { if (!user) return; return onSnapshot(collection(getFirebase().db, "players", user.uid, "connections"), (snapshot) => { setConnections(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as (typeof connections)[number])); setLoading(false); }, () => { setError("Could not load game connections."); setLoading(false); }); }, [user]);
  async function disconnect(gameId: string) { setBusy(gameId); setError(""); try { await accountIdAction("disconnect", { gameId }); } catch (failure) { setError((failure as Error).message); } finally { setBusy(""); } }
  return <section className="account-panel dashboard-section"><h2>Connected games</h2><p>Disconnecting stops all current Vihar ID access for that game. Your saved progress and past activity remain in your account. Reconnect by launching from Vihar or signing in on the game again.</p>{loading ? <p role="status">Loading connections…</p> : !connections.length ? <p>No connected games yet.</p> : <ul className="activity-list">{connections.map((game) => <li key={game.id}><div><strong>{game.title}</strong><span>{game.origin}</span></div><button className="button button-outline" disabled={!game.connected || !!busy} onClick={() => void disconnect(game.id)}>{game.connected ? busy === game.id ? "Disconnecting…" : "Disconnect" : "Disconnected"}</button></li>)}</ul>}{error && <p role="alert" className="account-error">{error}</p>}<Link href="/help/game-permissions">Understand game permissions</Link></section>;
}
