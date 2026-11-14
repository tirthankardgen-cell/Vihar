"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "./account/auth-provider";
import { buildEmbedUrl } from "@/lib/embedded-games";
import { accountIdAction } from "@/lib/vihar-id/client";
import type { QuickPlayGame } from "@/lib/quick-play";
import "./quick-play-fonts.css";
import styles from "./quick-play-detail.module.css";

const EmbeddedPlayer = dynamic(() => import("./embedded-player"));
type Launch = { id: string; url: string; uid: string | null; guest: boolean };
type Controls = { game: QuickPlayGame; launch: (guest?: boolean) => Promise<void>; busy: boolean; error: string; canPlayGuest: boolean; button: React.RefObject<HTMLButtonElement | null> };
const LaunchContext = createContext<Controls | null>(null);

export function QuickPlayExperience({ game, children }: { game: QuickPlayGame; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [session, setSession] = useState<Launch | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [canPlayGuest, setCanPlayGuest] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const scroll = useRef(0);
  const attempt = useRef(0);
  const mounted = useRef(true);
  const launching = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function launch(guest = false) {
    if (game.release.status !== "playable" || loading || launching.current) return;
    launching.current = true;
    const currentAttempt = ++attempt.current;
    setBusy(true); setError(""); setCanPlayGuest(false);
    if (!session) scroll.current = window.scrollY;
    try {
      const launchUrl = user && !guest ? (await accountIdAction("launch", { gameId: game.id })).url : game.embedUrl;
      const id = crypto.randomUUID();
      const url = buildEmbedUrl(game, id, window.location.origin, launchUrl);
      if (!mounted.current || attempt.current !== currentAttempt) return;
      setSession({ id, url, uid: guest ? null : user?.uid ?? null, guest });
    } catch {
      if (!mounted.current || attempt.current !== currentAttempt) return;
      setError("We couldn’t prepare your game. Try again, or play as a guest without account activity.");
      setCanPlayGuest(!!user && !guest);
      setSession(null);
    } finally {
      launching.current = false;
      if (mounted.current && attempt.current === currentAttempt) setBusy(false);
    }
  }

  const exit = useCallback(() => {
    setSession(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scroll.current, behavior: "instant" });
      button.current?.focus({ preventScroll: true });
    });
  }, []);
  const ready = useCallback(() => {
    if (!session) return;
    void import("@/lib/community").then(async ({ recordLaunch, rememberGuestLaunch }) => {
      if (session.uid) await recordLaunch(game.id, session.uid, "officialGames");
      else rememberGuestLaunch(game.id, "officialGames");
    }).catch(() => {
      if (mounted.current) setError("Your game opened, but its activity record could not be saved. Play again while connected to enable reviews.");
    });
  }, [session, game.id]);

  return <LaunchContext.Provider value={{ game, launch, busy: busy || loading, error, canPlayGuest, button }}>
    {session ? <EmbeddedPlayer key={session.id} game={game} sessionId={session.id} url={session.url} onReady={ready} onExit={exit} onRetry={() => { void launch(session.guest); }} /> : children}
  </LaunchContext.Provider>;
}

export function QuickPlayLaunchButton() {
  const controls = useContext(LaunchContext);
  if (!controls) throw new Error("Quick Play controls need a game page.");
  const { game, launch, busy, error, canPlayGuest, button } = controls;
  return <div className={styles.launch}>
    <button ref={button} type="button" className="button button-dark" disabled={game.release.status !== "playable" || busy} onClick={() => void launch()}>
      {game.release.status === "playable" ? <><Play size={17} aria-hidden="true" />{busy ? "Preparing…" : `Play ${game.title}`}</> : <>Coming soon <ArrowRight size={17} aria-hidden="true" /></>}
    </button>
    <p>{game.release.status === "playable" ? game.id === "sudoku" ? "Play here in your browser. Escape pauses your puzzle; use Exit to Vihar to return." : "Play here in your browser. Use Exit to Vihar or Escape to return." : "This game is in the making. Play will open here when it’s ready."}</p>
    {error && <p role="alert" className="account-error">{error}</p>}
    {canPlayGuest && <button type="button" className="button button-outline" disabled={busy} onClick={() => void launch(true)}>Play as a guest</button>}
  </div>;
}
