"use client";

import Link from "@/components/site-link";
import { Compass, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  useEffect(() => {
    // A third-party script cannot be unloaded by removing its tag. Leave the
    // whole document if an already monetized page fails during hydration.
    if (document.getElementById("google-adsense")) window.location.replace("/help");
  }, []);
  return (
    <div className="container not-found">
      <Compass aria-hidden="true" />
      <p className="eyebrow">A small detour</p>
      <h1>Let’s try<br /><em>that again.</em></h1>
      <p>This page didn’t load as expected. Try again, or head home to find your next escape.</p>
      <div className="not-found-actions"><button type="button" className="button button-dark" onClick={reset}><RotateCcw size={17} aria-hidden="true" />Try again</button><Link href="/" className="button button-outline">Back home</Link></div>
    </div>
  );
}
