"use client";
/* eslint-disable @next/next/no-img-element -- Creator-hosted image URLs render directly without a server image proxy. */

import { GameOrigin } from "./game-origin";
import { useRef, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Check, ChevronLeft, ChevronRight, ImagePlus, Rocket } from "lucide-react";
import { useAuth } from "@/components/account/auth-provider";
import { getFirebase } from "@/lib/firebase/client";
import { emptyGameDetails, validateGameDetails, type GameDetails } from "@/lib/game-publishing";
import type { CommunityGame } from "@/lib/community";

export function GameArtwork({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="game-artwork">{src && !failed ? <img src={src} alt={`${title} cover`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <div className="game-artwork-placeholder"><ImagePlus size={36} aria-hidden="true" /><span>{title || "Your next great game"}</span></div>}</div>;
}
const steps = ["Details", "Images & play guide", "Preview", "Visibility"];
export function GameEditor({ game, onSaved }: { game?: CommunityGame; onSaved?: () => void }) {
  const { user, profile } = useAuth();
  const [data, setData] = useState<GameDetails>(() => Object.fromEntries(Object.entries(emptyGameDetails).map(([key, value]) => [key, game?.[key as keyof GameDetails] ?? value])) as GameDetails);
  const [screenshots, setScreenshots] = useState((game?.screenshots ?? []).join("\n"));
  const [step, setStep] = useState(0), [published, setPublished] = useState(game?.published ?? false), [permission, setPermission] = useState(!!game);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  function change<K extends keyof GameDetails>(key: K, value: GameDetails[K]) { setData((old) => ({ ...old, [key]: value })); setMessage(""); }
  function details() { return { ...data, screenshots: screenshots.split("\n").map((url) => url.trim()).filter(Boolean) }; }
  function next() {
    if (!formRef.current?.reportValidity()) return;
    try { validateGameDetails(details(), false); setError(""); setStep((value) => Math.min(3, value + 1)); }
    catch (failure) { setError((failure as Error).message); }
  }
  async function save(asPublished: boolean) {
    if (!user || busy) return;
    setError(""); setMessage("");
    if (!permission) { setError("Confirm that you own this game or have permission to share it in the Visibility step."); setStep(3); return; }
    setBusy(true);
    try {
      const fields = { ...validateGameDetails(details(), asPublished), published: asPublished, updatedAt: serverTimestamp() };
      if (game) await updateDoc(doc(getFirebase().db, "communityGames", game.id), fields);
      else await addDoc(collection(getFirebase().db, "communityGames"), { ...fields, ownerId: user.uid, createdAt: serverTimestamp() });
      setMessage(asPublished ? "Your game is published in Community Games. Find its page in the Content tab." : "Draft saved. Only you can see it in the Content tab.");
      if (!game) { setData({ ...emptyGameDetails }); setScreenshots(""); setStep(0); setPermission(false); setPublished(false); }
      onSaved?.();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not save. Please try again."); } finally { setBusy(false); }
  }
  return <section className="studio-editor" aria-label={game ? `Edit ${game.title}` : "Create a game listing"}><div className="studio-editor-heading"><div><p className="eyebrow">{game ? "Edit your listing" : "A new world starts here"}</p><h2>{game ? game.title : "Publish a game"}</h2></div><span className="studio-draft-label">{game?.published ? "Published listing" : "Draft until you publish"}</span></div><ol className="studio-steps">{steps.map((label, index) => <li key={label}><button type="button" aria-current={step === index ? "step" : undefined} disabled={busy} onClick={() => { if (index < step) setStep(index); else if (formRef.current?.reportValidity()) { try { if (index > 0) validateGameDetails(details(), false); setStep(index); setError(""); } catch (failure) { setError((failure as Error).message); } } }}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}</ol>
    <form ref={formRef} className="studio-editor-body" onSubmit={(event) => { event.preventDefault(); if (step === 3) void save(published); else next(); }}>
      <div className="studio-fields community-form">
        {step === 0 && <><h3>Tell players about your game</h3><label>Game name<input value={data.title} onChange={(event) => change("title", event.target.value)} required maxLength={80} placeholder="A name worth remembering" /><small>{data.title.length}/80</small></label><label>Public game URL<input value={data.url} onChange={(event) => change("url", event.target.value)} required type="url" maxLength={2048} placeholder="https://your-game.com/" /><small>Your game stays on your hosting. Vihar gives it a page.</small></label><div className="studio-field-pair"><label>Game type<select value={data.kind} onChange={(event) => change("kind", event.target.value as GameDetails["kind"])}><option value="browser">Play in browser</option><option value="download">Downloadable game</option></select></label><label>Genre<input value={data.genre} onChange={(event) => change("genre", event.target.value)} maxLength={60} placeholder="Adventure, puzzle, racing…" /></label></div><label>Description<textarea value={data.description} onChange={(event) => change("description", event.target.value)} required maxLength={2000} rows={5} placeholder="The world, the challenge, and what makes it fun." /><small>{data.description.length}/2000</small></label></>}
        {step === 1 && <><h3>Show the world. Explain the play.</h3><label>Cover image URL<input value={data.coverUrl} onChange={(event) => change("coverUrl", event.target.value)} type="url" maxLength={2048} placeholder="https://…/cover.jpg" /><small>Use a public image URL. A 16:9 cover works best. Required to publish.</small></label><label>Screenshots<textarea value={screenshots} onChange={(event) => setScreenshots(event.target.value)} rows={3} placeholder="https://…/screenshot-1.jpg" /><small>Up to 6 public HTTPS image URLs, one per line.</small></label><label>How to play<textarea value={data.howToPlay} onChange={(event) => change("howToPlay", event.target.value)} maxLength={3000} rows={5} placeholder="1. Start a new game.&#10;2. Explore the world.&#10;3. Reach your goal." /><small>Explain the goal and the steps. Required to publish.</small></label><label>Controls<textarea value={data.controls} onChange={(event) => change("controls", event.target.value)} maxLength={1000} rows={2} placeholder="WASD to move · Space to jump · Touch controls on mobile" /></label><label>Devices & requirements<textarea value={data.requirements} onChange={(event) => change("requirements", event.target.value)} maxLength={1000} rows={2} placeholder="Supported devices, browser, download size, or system requirements" /></label></>}
        {step === 2 && <><h3>Your game page, at a glance</h3><p>Review what players will see in Community Games before making it public.</p><GameOrigin source="communityGames" /><p>Published by {profile ? `${profile.displayName} (@${profile.username})` : "you"}</p><GameArtwork key={data.coverUrl} src={data.coverUrl} title={data.title} /><h2>{data.title}</h2><p className="community-description">{data.description}</p>{details().screenshots.length > 0 && <div className="game-screenshots">{details().screenshots.map((url, index) => <GameArtwork key={`${url}-${index}`} src={url} title={`Screenshot ${index + 1}`} />)}</div>}<h3>How to play</h3><p className="community-description">{data.howToPlay || "Add a play guide before publishing."}</p>{data.controls && <><h3>Controls</h3><p className="community-description">{data.controls}</p></>}{data.requirements && <><h3>Requirements</h3><p className="community-description">{data.requirements}</p></>}</>}
        {step === 3 && <><h3>Choose who can discover your game</h3><label className={`visibility-option ${!published ? "selected" : ""}`}><input type="radio" name="visibility" checked={!published} onChange={() => setPublished(false)} /><span><strong>Private draft</strong><small>Keep working. Only you can access the listing.</small></span></label><label className={`visibility-option ${published ? "selected" : ""}`}><input type="radio" name="visibility" checked={published} onChange={() => setPublished(true)} /><span><strong>Public</strong><small>Appear in Community Games under your player profile, with a shareable page and player reviews.</small></span></label><div className="publish-checks"><h3>Ready for players?</h3>{[[!!data.title && !!data.description && !!data.url, "Game details"], [!!data.coverUrl, "Cover image"], [!!data.howToPlay.trim(), "How-to-play guide"]].map(([ok, label]) => <p key={String(label)}><span>{ok ? "✓" : "○"}</span> {label}</p>)}</div><label className="community-check"><input type="checkbox" checked={permission} onChange={(event) => setPermission(event.target.checked)} />I own this game and its images, or have permission to share them.</label></>}
      </div>
      {step !== 2 && <aside className="studio-preview"><p className="eyebrow">Listing preview</p><GameOrigin source="communityGames" /><p>Published by {profile ? `@${profile.username}` : "you"}</p><GameArtwork key={data.coverUrl} src={data.coverUrl} title={data.title} /><h3>{data.title || "Your game name"}</h3><p>{data.genre || "Your genre"} · {data.kind === "browser" ? "Browser game" : "Downloadable"}</p><span className="preview-rating">★ Not rated yet</span><p className="community-note">Players will discover this cover in Community Games. Ratings appear after your first review.</p></aside>}
      <div className="studio-editor-footer">{step > 0 && <button type="button" className="button button-outline" disabled={busy} onClick={() => setStep((value) => value - 1)}><ChevronLeft size={16} />Back</button>}<span className="community-note">Step {step + 1} of 4 · {busy ? "Saving…" : "Changes are saved when you choose Save or Publish"}</span><button className="button button-dark" disabled={busy}>{step === 3 ? (published ? <><Rocket size={16} />Publish game</> : "Save draft") : <>Continue<ChevronRight size={16} /></>}</button></div>
    </form>{error && <p role="alert" className="account-error studio-feedback">{error}</p>}<p role="status" className="studio-feedback">{message}</p>
  </section>;
}
