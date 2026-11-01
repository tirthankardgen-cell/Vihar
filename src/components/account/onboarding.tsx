"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { signOut } from "firebase/auth";
import { createProfile, isUsernameAvailable } from "@/lib/account/data";
import { accountError, normalizeUsername, usernameError, type AvatarId } from "@/lib/account/model";
import { getFirebase } from "@/lib/firebase/client";
import { useAuth } from "./auth-provider";
import { Avatar, AvatarPicker } from "./avatar";

export function Onboarding() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState(user?.displayName?.slice(0, 32) || "");
  const [avatar, setAvatar] = useState<AvatarId>("sun");
  const [availability, setAvailability] = useState<{ name: string; available: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const invalid = usernameError(username);
  useEffect(() => {
    if (invalid) return;
    let active = true;
    const timer = setTimeout(() => {
      void isUsernameAvailable(username).then((available) => { if (active) setAvailability({ name: username, available }); }).catch(() => { /* The transaction remains authoritative if availability cannot load. */ });
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [username, invalid]);
  const checked = availability?.name === username ? availability : null;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || invalid || !name.trim()) return;
    setBusy(true); setError("");
    try { await createProfile(user, { username, displayName: name, avatarId: avatar, bio: "" }); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  return <div className="onboarding-wrap container"><section className="onboarding-card"><div className="onboarding-heading"><div><p className="eyebrow">Set up your player profile</p><h1>Make it <em>yours.</em></h1><p className="account-muted">Choose your avatar and claim the username players will know you by.</p></div><Avatar id={avatar} size={96} /></div>
    <form onSubmit={(event) => void submit(event)}><fieldset className="account-fields" disabled={busy}><AvatarPicker value={avatar} onChange={setAvatar} disabled={busy} /><label className="account-field" htmlFor="display-name"><span>Display name</span><input id="display-name" autoComplete="nickname" value={name} onChange={(event) => setName(event.target.value)} maxLength={32} required placeholder="What should we call you?" /></label><label className="account-field" htmlFor="username"><span>Your unique username</span><div className="username-input"><span aria-hidden="true">@</span><input id="username" value={username} onChange={(event) => setUsername(normalizeUsername(event.target.value))} maxLength={20} minLength={3} pattern="[a-z][a-z0-9_]{2,19}" autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby="username-help username-availability" placeholder="your_username" /></div><small id="username-help">3–20 letters, numbers or underscores. Your username is permanent.</small></label><p className={`username-availability ${checked?.available ? "available" : ""}`} id="username-availability" aria-live="polite">{username && invalid ? invalid : checked ? checked.available ? <><Check size={15} aria-hidden="true" /> @{username} is yours to take</> : "That username is taken. Try another one." : username ? <><LoaderCircle size={15} aria-hidden="true" />Checking availability…</> : "Your identity across Vihar."}</p><p className="account-fine-print">Your avatar, display name, username and bio will be public at vihar.online/u/{username || "your_username"}. Your email stays private.</p><button className="button button-dark account-submit" disabled={!!invalid || checked?.available === false || !name.trim()} type="submit">{busy ? "Creating your profile…" : "Create my profile"}<ArrowRight size={18} aria-hidden="true" /></button></fieldset></form>{error && <p className="account-error" role="alert">{error}</p>}<button className="quiet-button" type="button" onClick={() => void signOut(getFirebase().auth).catch((failure) => setError(accountError(failure)))}>Use a different account</button>
  </section></div>;
}
