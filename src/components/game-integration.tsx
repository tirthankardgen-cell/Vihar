"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "@/components/site-link";
import { getFirebase } from "@/lib/firebase/client";
import { accountIdAction } from "@/lib/vihar-id/client";
import type { CommunityGame } from "@/lib/community";

export function GameIntegration({ game }: { game: CommunityGame }) {
  const [registration, setRegistration] = useState<{ enabled: boolean; verified: boolean; origin: string; url: string; authMode: string } | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  useEffect(() => onSnapshot(doc(getFirebase().db, "gameIntegrations", game.id), (snapshot) => setRegistration(snapshot.exists() ? snapshot.data() as typeof registration : null), () => setError("Could not load integration settings.")), [game.id]);
  async function register(enabled: boolean) {
    setBusy(true); setError("");
    try { await accountIdAction("register", { gameId: game.id, origin: new URL(game.url).origin, enabled }); setMessage(enabled ? "Registered. Install the SDK on your game website and run the test below." : "Integration disabled. Players can no longer connect."); }
    catch (failure) { setError((failure as Error).message); } finally { setBusy(false); }
  }
  async function test() {
    const popup = window.open("about:blank", "_blank");
    if (!popup) { setError("Allow popups to launch your test."); return; }
    popup.opener = null; setBusy(true); setError("");
    try { const result = await accountIdAction("launch", { gameId: game.id }); popup.location.replace(result.url); setMessage("On your own game site, start playing for at least 15 seconds. For login games, also use Sign in with Vihar ID. The status updates here automatically."); }
    catch (failure) { popup.close(); setError((failure as Error).message); } finally { setBusy(false); }
  }
  const current = registration?.url === game.url && registration.authMode === (game.authMode || "none");
  return <section className="integration-panel"><h3>Vihar ID &amp; play tracking</h3><p>Game ID: <code>{game.id}</code></p><p>{game.authMode === "vihar-id" ? "Vihar ID login and game-scoped cloud saves" : "Direct play · tracking without in-game login"}</p><p role="status">{registration?.verified && current && registration.enabled ? "✓ Integration test passed. Ready to publish." : "Save your draft, register its origin, then test the SDK on your game website."}</p><pre className="integration-code"><code>{`import { createViharId } from "https://vihar.online/sdk/vihar-id.js";\nconst vihar = createViharId({ gameId: "${game.id}" });\nawait vihar.resumeLaunch();\n${game.authMode === "vihar-id" ? 'vihar.mount("#vihar-login");\n' : ""}// When gameplay starts:\nawait vihar.startSession();\n// On pause: vihar.setPlaying(false);\n// On resume: vihar.setPlaying(true);`}</code></pre><p>Add this to your hosted game, following the <Link href="/help/browser-sdk">complete SDK guide</Link>. {game.authMode === "vihar-id" && "Keep the Vihar ID button, sign-out control, and shared-identity explanation visible on your own website."}</p><div className="community-actions"><button disabled={busy} onClick={() => void register(true)}>Register saved game URL</button><button disabled={busy || !registration?.enabled || !current} onClick={() => void test()}>Open integration test</button>{registration?.enabled && <button disabled={busy} onClick={() => void register(false)}>Disable connection</button>}</div>{error && <p role="alert" className="account-error">{error}</p>}<p role="status">{message}</p></section>;
}
