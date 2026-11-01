"use client";
import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function ShareProfile({ username, compact = false }: { username: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false), [fallback, setFallback] = useState("");
  async function share() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      if (navigator.share) await navigator.share({ title: `@${username} on Vihar`, text: "Find me on Vihar. A space to play.", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 4000); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFallback(url);
    }
  }
  return <div className="share-control"><button type="button" className={compact ? "quiet-button" : "button button-outline"} onClick={() => void share()}>{copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}{copied ? "Link copied" : "Share profile"}</button><span className="sr-only" role="status">{copied ? "Profile link copied to clipboard." : ""}</span>{fallback && <label className="share-fallback"><Copy size={14} aria-hidden="true" />Copy your profile link<input readOnly value={fallback} onFocus={(event) => event.target.select()} aria-label="Profile link" /></label>}</div>;
}
