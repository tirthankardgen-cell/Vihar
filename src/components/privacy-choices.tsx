"use client";

import { useEffect, useState } from "react";

type GooglePrivacy = {
  callbackQueue: Array<{ CONSENT_API_READY: () => void }>;
  showRevocationMessage?: () => void;
};

declare global {
  interface Window { googlefc?: GooglePrivacy }
}

// Uses Google's certified message, not a custom cookie banner or consent signal.
export function PrivacyChoices() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const googlefc = window.googlefc ??= { callbackQueue: [] };
    googlefc.callbackQueue ??= [];
    googlefc.callbackQueue.push({ CONSENT_API_READY: () => {
      if (active) setReady(typeof googlefc.showRevocationMessage === "function");
    } });
    return () => { active = false; };
  }, []);

  function openChoices() {
    try {
      if (!window.googlefc?.showRevocationMessage) throw new Error("Consent controls unavailable");
      window.googlefc.showRevocationMessage();
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  return <section id="privacy-choices" className="privacy-choices" aria-labelledby="privacy-choices-title">
    <h2 id="privacy-choices-title">Advertising choices</h2>
    <button type="button" className="button button-outline" disabled={!ready} onClick={openChoices}>Privacy and cookie settings</button>
    <p role="status">{failed ? "Privacy controls could not open. You can still read this guide and use the game." : ready ? "Reopen Google’s consent message to change your choices where it applies." : "Privacy controls become available when Google’s consent message loads. The guide remains available if it cannot load."}</p>
    <p>For Google’s account-level ad preferences, visit <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">My Ad Center</a>. Read our <a href="/privacy">privacy notice</a> for other choices and contact information.</p>
  </section>;
}
