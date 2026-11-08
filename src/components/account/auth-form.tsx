"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "@/components/site-link";
import { accountError, safeReturnPath } from "@/lib/account/model";
import { getFirebase } from "@/lib/firebase/client";
import { useAuth } from "./auth-provider";
import { Avatar } from "./avatar";

export function GoogleMark() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z"/><path fill="#34a853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z"/><path fill="#ea4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.5 9.5 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"/></svg>;
}
export function PasswordInput({ id = "password", label = "Password", newPassword = false }: { id?: string; label?: string; newPassword?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="account-field"><label htmlFor={id}>{label}</label><span className="password-input"><input id={id} name={id} type={visible ? "text" : "password"} autoComplete={newPassword ? "new-password" : "current-password"} required minLength={newPassword ? 8 : undefined} maxLength={128} aria-describedby={newPassword ? `${id}-hint` : undefined} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{newPassword && <small id={`${id}-hint`}>At least 8 characters, with a letter and a number.</small>}</div>;
}
export function AuthForm({ mode, embedded = false, onModeChange }: { mode: "login" | "signup" | "reset"; embedded?: boolean; onModeChange?: (mode: "login" | "signup" | "reset") => void }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeReturnPath(params.get("next"));
  const signup = mode === "signup", reset = mode === "reset";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (!embedded && !loading && user && !reset) router.replace(next); }, [user, loading, reset, router, next, embedded]);
  useEffect(() => {
    if (mode === "login" && error) errorRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [error, mode]);
  async function google() {
    setBusy(true); setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getFirebase().auth, provider);
      if (!embedded) router.replace(next);
    } catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    try {
      const { auth } = getFirebase();
      if (reset) {
        try { await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` }); }
        catch (failure) { if (!(failure && typeof failure === "object" && "code" in failure && failure.code === "auth/user-not-found")) throw failure; }
        setSent(true);
      } else if (signup) {
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { setError("Include a letter and a number in your password."); return; }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        // An email delivery failure must not misreport successful account creation.
        try { await sendEmailVerification(credential.user, { url: `${window.location.origin}/dashboard` }); } catch { /* The dashboard offers resend. */ }
        if (!embedded) router.replace(next);
      } else { await signInWithEmailAndPassword(auth, email, password); if (!embedded) router.replace(next); }
    } catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  if (embedded) return <section className="id-credentials" aria-labelledby="auth-title">
    <h1 id="auth-title">{reset ? "Reset your password" : signup ? "Create your Vihar ID" : "Sign in to Vihar ID"}</h1>
    <p className="id-description">{reset ? "We’ll email you a password reset link." : signup ? "One player identity for your games and progress." : "Use your Vihar account to continue to the game."}</p>
    {sent ? <div className="account-success" role="status"><Mail size={24} aria-hidden="true" /><h2>Check your inbox</h2><p>If that email has an account, a reset link is on its way.</p><button type="button" className="id-text-button" onClick={() => onModeChange?.("login")}>Back to sign in</button></div> : <>
      {!reset && <><button type="button" className="google-button" onClick={() => void google()} disabled={busy}><GoogleMark />Continue with Google</button><div className="form-divider"><span>or use your email</span></div></>}
      <form onSubmit={(event) => void submit(event)}>
        <fieldset disabled={busy} className="account-fields">
          <label className="account-field" htmlFor="email"><span>Email address</span><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>
          {!reset && <PasswordInput newPassword={signup} />}
          {signup && <label className="account-checkbox"><input type="checkbox" required /><span>I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy notice</a>.</span></label>}
          {!reset && !signup && <button type="button" className="id-text-button id-forgot" onClick={() => onModeChange?.("reset")}>Forgot password?</button>}
          <button className="button button-dark account-submit" type="submit">{busy ? "Please wait…" : reset ? "Send reset link" : signup ? "Create Vihar ID" : "Sign in"}<ArrowRight size={16} aria-hidden="true" /></button>
        </fieldset>
      </form>
      {error && <p ref={errorRef} className="account-error" role="alert">{error}</p>}
      <p className="id-auth-switch">{!reset && (signup ? "Already have an ID? " : "New to Vihar? ")}<button className="id-text-button" type="button" disabled={busy} onClick={() => onModeChange?.(signup || reset ? "login" : "signup")}>{signup || reset ? "Sign in" : "Create an account"}</button></p>
    </>}
  </section>;
  return <div className="account-auth container">
    <section className="auth-story" aria-labelledby="id-story-title"><p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Your player identity</p><h2 id="id-story-title">One ID.<br />A world of <em>play.</em></h2><p>Your profile, your games, your community. Make your mark on Vihar.</p><div className="id-preview"><div className="id-preview-top"><span>VIHAR <b>ID</b></span><span aria-hidden="true">✳</span></div><Avatar id="tiger" size={94} /><p>Player One</p><span>@your_username</span><div className="id-preview-bottom"><span>Your name in the game</span><span aria-hidden="true">↗</span></div></div><div className="auth-story-note"><ShieldCheck size={18} aria-hidden="true" /><p>One identity for Vihar.<br /><span>More games. Same you.</span></p></div></section>
    <section className="auth-form-panel" aria-labelledby="auth-title"><p className="eyebrow">{reset ? "A fresh start" : signup ? "Your next chapter" : "Your space awaits"}</p><h1 id="auth-title">{reset ? "Forgot your password?" : signup ? <>Create your<br /><em>player ID.</em></> : <>Welcome <br /><em>back.</em></>}</h1><p className="account-muted">{reset ? "We’ll send you a link to choose a new one." : signup ? "Choose your username. Build your profile. Find your next game." : "Sign in to your Vihar ID and pick up where you left off."}</p>
    {sent ? <div className="account-success" role="status"><Mail size={28} aria-hidden="true" /><h2>Check your inbox.</h2><p>If that email has an account, a reset link is on its way. Check your spam folder too.</p><Link href="/login" className="text-link">Back to sign in <ArrowRight size={16} aria-hidden="true" /></Link></div> : <>
      {!reset && <><button type="button" className="google-button" onClick={() => void google()} disabled={busy}><GoogleMark />Continue with Google</button><div className="form-divider"><span>or with email</span></div></>}
      <form onSubmit={(event) => void submit(event)}><fieldset disabled={busy} className="account-fields"><label className="account-field" htmlFor="email"><span>Email address</span><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>{!reset && <PasswordInput newPassword={signup} />}{signup && <label className="account-checkbox"><input type="checkbox" required /><span>I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy notice</Link>.</span></label>}{!reset && !signup && <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>}<button className="button button-dark account-submit" type="submit">{busy ? "Please wait…" : reset ? "Send reset link" : signup ? "Create my Vihar ID" : "Sign in"}<ArrowRight size={17} aria-hidden="true" /></button></fieldset></form>
      {error && <p ref={errorRef} className="account-error" role="alert">{error}</p>}
      {!reset && <p className="auth-switch">{signup ? "Already have an ID?" : "New around here?"} <Link href={`${signup ? "/login" : "/signup"}${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}>{signup ? "Sign in" : "Create your Vihar ID"} <ArrowRight size={13} aria-hidden="true" /></Link></p>}
      {reset && <Link href="/login" className="text-link">Back to sign in</Link>}
    </>}
    <p className="auth-fine-print">{signup ? "Continuing with Google also means you agree to our " : "Your sign-in details stay private. "}{signup ? <><Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy notice</Link>.</> : <Link href="/games">Just here to play? Explore the games.</Link>}</p></section>
  </div>;
}
