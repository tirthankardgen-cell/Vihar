"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";

type PreparedCard = { file: File; preview: string; canShare: boolean };

export function ShareProfile({ username, version = 0, compact = false }: { username: string; version?: number; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [card, setCard] = useState<PreparedCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState("");
  const path = `/u/${encodeURIComponent(username)}`;
  const cardPath = `${path}/card?v=portrait-2-${version}`;

  useEffect(() => () => {
    request.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function release() {
    request.current?.abort();
    request.current = null;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setCard(null);
  }

  async function prepare() {
    release();
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(cardPath, { signal: controller.signal, credentials: "omit" });
      if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "image/png") throw new Error("Card unavailable");
      const blob = await response.blob();
      if (request.current !== controller || controller.signal.aborted) return;
      const file = new File([blob], `vihar-${username}-id.png`, { type: "image/png" });
      let canShare = false;
      try { canShare = typeof navigator.share === "function" && navigator.canShare?.({ files: [file] }) === true; }
      catch { /* Browsers that decline file sharing still support the download. */ }
      const preview = URL.createObjectURL(file);
      objectUrl.current = preview;
      setCard({ file, preview, canShare });
    } catch {
      if (request.current === controller) setError("Couldn’t prepare this ID card. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) setLoading(false);
    }
  }

  function open() {
    setCopied(false);
    setFallback("");
    setSharing(false);
    dialog.current?.showModal();
    void prepare();
  }

  async function shareCard() {
    if (!card?.canShare || sharing) return;
    setSharing(true);
    setError("");
    try {
      // Prepare the image before this tap so a network wait cannot consume
      // the user activation required by native sharing on phones.
      await navigator.share({ files: [card.file], title: `@${username} · Vihar ID`, text: `@${username} on Vihar\n${window.location.origin}${path}` });
      dialog.current?.close();
    } catch (failure) {
      if (!(failure instanceof DOMException && failure.name === "AbortError")) setError("Couldn’t share the photo. Download the card and attach it in your chat.");
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}${path}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setFallback(""); }
    catch { setFallback(url); }
  }

  return <>
    <button type="button" className={compact ? "quiet-button" : "button button-outline"} onClick={open}><Share2 size={16} aria-hidden="true" />Share ID card</button>
    <dialog ref={dialog} className="id-share-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onClose={release}>
      <div className="id-share-content">
        <div className="id-share-header">
          <div><h2 id={titleId} className="id-share-title">Share this Vihar ID</h2><p id={descriptionId}>Send the full player card as a photo.</p></div>
          <button type="button" className="id-share-close" aria-label="Close sharing" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button>
        </div>
        {loading && <p className="id-share-loading" role="status">Preparing your ID card…</p>}
        {card && <Image className="id-share-preview" src={card.preview} alt={`@${username}'s vertical Vihar ID card`} width={900} height={1200} unoptimized />}
        {error && <p className="id-share-error" role="alert">{error}</p>}
        {!loading && !card && <button type="button" className="button button-dark" onClick={() => void prepare()}>Try again</button>}
        {card && <>
          <p className="id-share-hint">{card.canShare ? "Choose WhatsApp or another app to share the photo." : "Download the card, then attach it as a photo in WhatsApp or another app."}</p>
          <div className="id-share-actions">
            {card.canShare && <button type="button" className={`button button-dark id-share-primary`} onClick={() => void shareCard()} disabled={sharing}><Share2 size={16} aria-hidden="true" />{sharing ? "Opening sharing…" : "Share ID card"}</button>}
            <a className={`button ${card.canShare ? "button-outline" : "button-dark"}`} href={`${cardPath}&download=1`} download={card.file.name}><Download size={16} aria-hidden="true" />Download ID card</a>
          </div>
        </>}
        <button type="button" className={`quiet-button id-share-copy`} onClick={() => void copyLink()}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copied ? "Link copied" : "Copy profile link"}</button>
        <span className="sr-only" role="status">{copied ? "Profile link copied to clipboard." : ""}</span>
        {fallback && <label className="id-share-fallback">Profile link<input readOnly value={fallback} onFocus={(event) => event.target.select()} /></label>}
      </div>
    </dialog>
  </>;
}
