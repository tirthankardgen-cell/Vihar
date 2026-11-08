"use client";

import { useEffect, useState } from "react";
import Link from "@/components/site-link";
import { useAuth } from "./auth-provider";
import { Onboarding } from "./onboarding";
import { accountIdAction } from "@/lib/vihar-id/client";

type ConnectRequest = { gameId: string; origin: string; challenge: string; state: string };
export function GameConnect() {
  const { user, profile, loading, error: authError, retry } = useAuth();
  const [request, setRequest] = useState<ConnectRequest | null>(null);
  const [game, setGame] = useState<{ title: string; origin: string } | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [complete, setComplete] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const raw = params.has("gameId") ? Object.fromEntries(params) : JSON.parse(sessionStorage.getItem("vihar:connect") || "null");
      if (!raw || !/^[A-Za-z0-9_-]{1,128}$/.test(raw.gameId) || !/^[A-Za-z0-9_-]{43}$/.test(raw.challenge) || !/^[a-f0-9]{64}$/.test(raw.state) || new URL(raw.origin).origin !== raw.origin) throw new Error("Start sign-in using the Vihar ID button on the game’s website.");
      if (params.has("gameId")) sessionStorage.setItem("vihar:connect", JSON.stringify({ ...raw, storedAt: Date.now() }));
      else if (!raw.storedAt || Date.now() - raw.storedAt > 300000) throw new Error("This sign-in request expired. Start again on the game’s website.");
      queueMicrotask(() => setRequest(raw));
    } catch (failure) { queueMicrotask(() => setError((failure as Error).message)); }
  }, []);
  useEffect(() => {
    if (!request || !user) return;
    let active = true;
    void accountIdAction("info", { gameId: request.gameId }).then((value) => { if (active) { if (value.origin !== request.origin) setError("The requesting website is not this game’s registered origin."); else setGame(value); } }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [request, user]);
  async function decide(allow: boolean) {
    if (!request || !window.opener) { setError("The game window is unavailable. Return to the game and start sign-in again."); return; }
    setBusy(true); setError("");
    try {
      const result = allow ? await accountIdAction("authorize", request) : { error: "access_denied" };
      window.opener.postMessage({ type: "vihar:id:authorization", state: request.state, ...result }, request.origin);
      sessionStorage.removeItem("vihar:connect"); setComplete(true);
    } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); }
  }
  if (!loading && user && !profile && !authError) return <Onboarding />;
  return <section className="container id-connect"><p className="eyebrow">Vihar ID · Secure game connection</p><h1>{complete ? "You’re all set." : "Same player. A new adventure."}</h1>{complete ? <p>Return to your game. You can close this window.</p> : <>
    {loading ? <p role="status">Loading your Vihar ID…</p> : !user ? <><p>Sign in on Vihar to connect your account to the game. Your password stays here.</p><Link className="button button-dark" href="/login?next=%2Fauth%2Fconnect">Sign in to Vihar ID</Link><Link className="text-link" href="/signup?next=%2Fauth%2Fconnect">Create a Vihar ID</Link></> : game && request && <><h2>Connect to {game.title}</h2><p>Requested by <strong>{game.origin}</strong>. Signed in as <strong>@{profile?.username}</strong>.</p><p>This game can read your player ID, display name, username and avatar; save and load its own game progress; and record its play sessions in your private dashboard.</p><p>It cannot access your email, password, friends, or another game’s saves. Disconnect it any time in your dashboard.</p><div className="community-actions"><button className="button button-dark" disabled={busy} onClick={() => void decide(true)}>Allow &amp; return to game</button><button className="button button-outline" disabled={busy} onClick={() => void decide(false)}>Cancel</button></div></>}
    {(error || authError) && <p className="account-error" role="alert">{error || authError}</p>}{authError && <button onClick={retry}>Retry sign-in</button>}<p><Link href="/help/game-permissions">Game permissions</Link> · <Link href="/privacy">Privacy</Link></p>
  </>}</section>;
}
