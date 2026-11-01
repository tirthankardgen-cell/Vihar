"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gamepad2, LoaderCircle } from "lucide-react";
import { signOut } from "firebase/auth";
import { createProfile, isUsernameAvailable } from "@/lib/account/data";
import { accountError, normalizeUsername, usernameError, type AvatarId } from "@/lib/account/model";
import { getFirebase } from "@/lib/firebase/client";
import { useAuth } from "./auth-provider";
import { Avatar, AvatarPicker } from "./avatar";

export function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [name, setName] = useState(user?.displayName?.slice(0, 32) || "");
  const [avatar, setAvatar] = useState<AvatarId>("sun");
  const [availability, setAvailability] = useState<{ name: string; available: boolean | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null);
  const errorMessage = useRef<HTMLParagraphElement>(null);
  const invalid = usernameError(username);

  useEffect(() => {
    if (invalid) return;
    let active = true;
    const timer = setTimeout(() => {
      void isUsernameAvailable(username)
        .then((available) => { if (active) setAvailability({ name: username, available }); })
        .catch(() => { if (active) setAvailability({ name: username, available: null }); });
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [username, invalid]);
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (error) errorMessage.current?.scrollIntoView({ block: "nearest" });
  }, [error]);

  const checked = availability?.name === username ? availability : null;
  const canContinue = !invalid && checked?.available !== false && !!name.trim();
  const usernameStatus = username && invalid ? invalid : checked
    ? checked.available === true ? <><Check size={15} aria-hidden="true" /> @{username} is yours to take</>
      : checked.available === false ? "That username is taken. Try another one."
        : "We’ll confirm your username when you create your profile."
    : username ? <><LoaderCircle size={15} aria-hidden="true" />Checking availability…</> : "Your identity across Vihar.";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !canContinue || busy) return;
    setError("");
    if (step === 1) { setStep(2); return; }
    setBusy(true);
    try { await createProfile(user, { username, displayName: name, avatarId: avatar, bio: "" }); }
    catch (failure) {
      setError(accountError(failure));
      if (failure && typeof failure === "object" && "code" in failure && failure.code === "username-taken") {
        setAvailability({ name: username, available: false });
        setStep(1);
      }
    } finally { setBusy(false); }
  }

  return <div className="onboarding-page"><div className="onboarding-wrap container">
    <aside className="onboarding-preview" aria-label="Live Vihar ID preview">
      <div className="onboarding-preview-intro"><p className="eyebrow"><Gamepad2 size={17} aria-hidden="true" /> Your player identity</p><h2>Your name.<br /><em>Your game.</em></h2><p>Build the profile players will know you by.</p></div>
      <div className="onboarding-id-card">
        <div className="onboarding-id-top"><span>VIHAR <b>ID</b></span><span className="onboarding-preview-badge">Live preview</span></div>
        <Avatar id={avatar} size={104} />
        <strong>{name.trim() || "Your player name"}</strong>
        <span className="onboarding-id-username">@{username || "your_username"}</span>
        <div className="onboarding-id-bottom"><span>YOUR IDENTITY ON VIHAR</span><Gamepad2 size={15} aria-hidden="true" /></div>
      </div>
      <p className="onboarding-preview-note">Your profile. Your games. Your community.</p>
    </aside>

    <section className="onboarding-card" ref={panel} aria-labelledby="onboarding-title">
      <ol className="onboarding-steps" aria-label="Profile setup progress"><li aria-current={step === 1 ? "step" : undefined} data-complete={step > 1 || undefined}><span>{step > 1 ? <Check size={13} aria-hidden="true" /> : "01"}</span>Identity</li><li aria-current={step === 2 ? "step" : undefined}><span>02</span>Avatar</li></ol>
      <div className="onboarding-heading"><div><h1 id="onboarding-title" ref={heading} tabIndex={-1}>{step === 1 ? "Choose your name." : "Choose your avatar."}</h1><p className="account-muted onboarding-description">{step === 1 ? "A name for your profile. A username that’s yours." : "Pick your player portrait. You can change it later."}</p></div></div>
      <form onSubmit={(event) => void submit(event)}>
        <fieldset className="account-fields" disabled={busy}>
          {step === 1 ? <>
            <label className="account-field" htmlFor="display-name"><span>Display name</span><input id="display-name" autoComplete="nickname" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={32} required placeholder="What should we call you?" /></label>
            <label className="account-field" htmlFor="username"><span>Your unique username</span><div className="username-input"><span aria-hidden="true">@</span><input id="username" value={username} onChange={(event) => { setUsername(normalizeUsername(event.target.value)); setError(""); }} maxLength={20} minLength={3} pattern="[a-z][a-z0-9_]{2,19}" autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby="username-help username-availability" placeholder="your_username" /></div><small id="username-help">3–20 letters, numbers or underscores. Your username is permanent.</small></label>
          </> : <AvatarPicker value={avatar} onChange={setAvatar} disabled={busy} />}
          <p className={`username-availability ${checked?.available ? "available" : ""}`} id="username-availability" aria-live="polite">{usernameStatus}</p>
          <p className="account-fine-print onboarding-privacy">Your name, username and avatar are public. Your email stays private.</p>
          {error && <p className="account-error" ref={errorMessage} role="alert">{error}</p>}
          <div className="onboarding-actions">
            {step === 2 && <button className="button button-outline" type="button" onClick={() => { setStep(1); setError(""); }}><ArrowLeft size={17} aria-hidden="true" />Back</button>}
            <button key={step} className="button button-dark" disabled={!canContinue} type="submit">{step === 1 ? "Continue" : busy ? "Creating your profile…" : "Create my profile"}<ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </fieldset>
      </form>
      <button className="quiet-button onboarding-switch-account" type="button" disabled={busy} onClick={() => void signOut(getFirebase().auth).catch((failure) => setError(accountError(failure)))}>Use a different account</button>
    </section>
  </div></div>;
}
