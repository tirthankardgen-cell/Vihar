"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, RotateCcw } from "lucide-react";
import { usePlayerFrame } from "./site-frame";
import { embedMessage, embedReadyTimeout, embedStopTimeout, readGameEmbedMessage } from "@/lib/embedded-games";
import type { QuickPlayGame } from "@/lib/quick-play";
import styles from "./embedded-player.module.css";

type Props = {
  game: QuickPlayGame;
  sessionId: string;
  url: string;
  onReady: () => void;
  onExit: () => void;
  onRetry: () => void;
};

export default function EmbeddedPlayer({ game, sessionId, url, onReady, onExit, onRetry }: Props) {
  const activate = usePlayerFrame();
  const frame = useRef<HTMLIFrameElement>(null);
  const initialize = useRef(() => {});
  const requestExit = useRef(() => {});
  const fail = useRef(() => {});
  const recovery = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error" | "stopping">("loading");

  useLayoutEffect(() => {
    const release = activate();
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    recovery.current?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      release();
    };
  }, [activate]);

  useEffect(() => {
    let ready = false, failed = false, closing = false, finished = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    const send = (message: Parameters<typeof embedMessage>[2]) => frame.current?.contentWindow?.postMessage(embedMessage(game.id, sessionId, message), game.allowedOrigin);
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(stopTimer);
      onExit();
    };
    requestExit.current = () => {
      if (closing) return;
      if (failed || !ready) { send({ type: "stop" }); finish(); return; }
      closing = true;
      setPhase("stopping");
      send({ type: "stop" });
      // The game flushes its SDK session before acknowledging. Recovery is
      // bounded even if its code or network no longer responds.
      stopTimer = setTimeout(finish, embedStopTimeout);
    };
    const error = () => {
      if (failed || closing || finished) return;
      failed = true;
      clearTimeout(timeout);
      clearInterval(handshake);
      send({ type: "stop" });
      setPhase("error");
      requestAnimationFrame(() => recovery.current?.focus());
    };
    fail.current = error;
    const init = () => { if (!failed && !closing) send({ type: "init", visible: document.visibilityState === "visible" }); };
    initialize.current = init;
    const receive = (event: MessageEvent<unknown>) => {
      const message = readGameEmbedMessage(event, game, sessionId, frame.current?.contentWindow ?? null);
      if (!message || failed || finished) return;
      if (message.type === "exit") requestExit.current();
      else if (message.type === "stopped" && closing) finish();
      else if (message.type === "error") error();
      else if (message.type === "ready" && !ready && !closing) {
        ready = true;
        clearTimeout(timeout);
        clearInterval(handshake);
        setPhase("ready");
        onReady();
        requestAnimationFrame(() => frame.current?.focus());
      }
    };
    const visibility = () => send({ type: "visibility", visible: document.visibilityState === "visible" });
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); requestExit.current(); } };
    const pagehide = () => send({ type: "stop" });
    const timeout = setTimeout(error, embedReadyTimeout);
    const handshake = setInterval(init, 500);
    window.addEventListener("message", receive);
    window.addEventListener("keydown", keyboard);
    window.addEventListener("pagehide", pagehide);
    document.addEventListener("visibilitychange", visibility);
    init();
    return () => {
      send({ type: "stop" });
      clearTimeout(timeout); clearTimeout(stopTimer); clearInterval(handshake);
      window.removeEventListener("message", receive);
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("pagehide", pagehide);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [game, sessionId, onReady, onExit]);

  return <section className={styles.player} aria-label={`Playing ${game.title}`}>
    {phase !== "error" && <iframe
      ref={frame}
      className={styles.iframe}
      style={{ visibility: phase === "ready" ? "visible" : "hidden" }}
      title={`${game.title} — Quick Play`}
      src={url}
      // This configuration is for the allowlisted first-party games host only.
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      tabIndex={phase === "ready" ? 0 : -1}
      aria-hidden={phase !== "ready"}
      onLoad={() => initialize.current()}
      onError={() => fail.current()}
    />}
    <button ref={recovery} type="button" className={`${styles.recovery} ${phase === "ready" ? styles.recoveryQuiet : ""}`} onClick={() => requestExit.current()} aria-label="Back to game details"><ArrowLeft size={17} aria-hidden="true" /><span>Back to details</span></button>
    {phase !== "ready" && <div className={styles.playerState} role={phase === "error" ? "alert" : "status"}>
      {phase !== "error" && <LoaderCircle size={30} className={styles.spinner} aria-hidden="true" />}
      <p className="eyebrow">{game.title}</p>
      <h1>{phase === "error" ? "The game couldn’t open." : phase === "stopping" ? "See you next round." : "Getting your game ready…"}</h1>
      <p>{phase === "error" ? "Check your connection and try again, or return to the game details." : phase === "stopping" ? "Returning to Vihar…" : "You’ll be playing right here."}</p>
      {phase === "error" && <button type="button" className="button button-dark" onClick={onRetry}><RotateCcw size={17} aria-hidden="true" />Retry game</button>}
    </div>}
  </section>;
}
