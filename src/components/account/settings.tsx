"use client";

import { useState } from "react";
import { GoogleAuthProvider, linkWithPopup, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { Check, Download, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import Link from "@/components/site-link";
import { editProfile, exportAccount } from "@/lib/account/data";
import { accountError, type AvatarId } from "@/lib/account/model";
import { getFirebase } from "@/lib/firebase/client";
import { useAuth } from "./auth-provider";
import { Avatar, AvatarPicker } from "./avatar";
import { GoogleMark, PasswordInput } from "./auth-form";
import { ShareProfile } from "./share-profile";

export function SettingsDashboard({ supportEmail }: { supportEmail: string }) {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile!.displayName), [bio, setBio] = useState(profile!.bio);
  const [avatar, setAvatar] = useState<AvatarId>(profile!.avatarId);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(""), [error, setError] = useState("");
  const providers = user!.providerData.map((provider) => provider.providerId);
  async function run(label: string, action: () => Promise<void>, success: string) {
    setBusy(label); setMessage(""); setError("");
    try { await action(); setMessage(success); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(""); }
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    void run("profile", () => editProfile(user!.uid, { displayName: name, bio, avatarId: avatar }), "Profile saved. Looking good.");
  }
  function addPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("new-password"));
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { setError("Include a letter and a number in your password."); return; }
    if (!user?.email) return;
    void run("password", () => updatePassword(user, password), "Email and password sign-in is now connected to this same Vihar ID.");
  }
  async function download() {
    const data = await exportAccount(user!, profile!);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `vihar-${profile!.username}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <><div className="dashboard-heading"><div><p className="eyebrow">Just the way you like it</p><h1>Your <em>account.</em></h1><p className="account-muted">Manage your player identity and sign-in methods.</p></div><ShareProfile username={profile!.username} version={profile!.updatedAt?.toMillis() || 0} /></div>
    <div className="settings-feedback" aria-live="polite">{message && <p className="account-success-note"><Check size={17} aria-hidden="true" />{message}</p>}{error && <p className="account-error" role="alert">{error}</p>}</div>
    <section className="account-panel settings-profile"><div className="account-section-heading"><div><h2>Your public profile</h2><p className="account-muted">Your identity across the Vihar community.</p></div><Avatar id={avatar} size={72} /></div><form onSubmit={save}><fieldset className="account-fields" disabled={!!busy}><AvatarPicker value={avatar} onChange={setAvatar} disabled={!!busy} /><div className="settings-field-grid"><label className="account-field" htmlFor="settings-name"><span>Display name</span><input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={32} required autoComplete="nickname" /></label><label className="account-field" htmlFor="settings-username"><span>Username <LockKeyhole size={12} aria-hidden="true" /></span><input id="settings-username" value={`@${profile!.username}`} readOnly aria-describedby="immutable-username" /><small id="immutable-username">Your unique username stays with your ID.</small></label></div><label className="account-field" htmlFor="settings-bio"><span>About you <small>{bio.length}/160</small></span><textarea id="settings-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} rows={3} placeholder="Your favourite games, play style, or next challenge." /></label><div className="settings-save"><p>Your name, avatar and bio are public. <Link href={`/u/${profile!.username}`}>View your profile.</Link></p><button type="submit" className="button button-dark" disabled={!name.trim()}><Save size={16} aria-hidden="true" />{busy === "profile" ? "Saving…" : "Save changes"}</button></div></fieldset></form></section>
    <section className="account-panel settings-security"><div className="account-section-heading"><h2>Sign-in &amp; security</h2><ShieldCheck size={21} aria-hidden="true" /></div><div className="settings-account-email"><div><span className="eyebrow">Private email address</span><strong>{user!.email}</strong></div><span className={`status-badge ${user!.emailVerified ? "status-available" : "status-upcoming"}`}>{user!.emailVerified ? "Verified" : "Verification needed"}</span></div><div className="connected-provider"><GoogleMark /><div><strong>Google</strong><span>{providers.includes("google.com") ? "Connected to your Vihar ID" : "Another way into the same account"}</span></div>{providers.includes("google.com") ? <Check size={19} aria-label="Connected" /> : <button className="button button-outline" type="button" disabled={!!busy} onClick={() => void run("google", async () => { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); await linkWithPopup(user!, provider); }, "Google connected to your Vihar ID.")}>{busy === "google" ? "Connecting…" : "Connect Google"}</button>}</div><div className="connected-provider"><LockKeyhole size={19} aria-hidden="true" /><div><strong>Email &amp; password</strong><span>{providers.includes("password") ? "Connected to your Vihar ID" : "Add a password to sign in with your email"}</span></div>{providers.includes("password") && <button type="button" className="button button-outline" disabled={!!busy} onClick={() => void run("reset", () => sendPasswordResetEmail(getFirebase().auth, user!.email!, { url: `${window.location.origin}/login` }), "Password reset email sent. Check your inbox.")}>{busy === "reset" ? "Sending…" : "Reset password"}</button>}</div>{!providers.includes("password") && <form className="add-password-form" onSubmit={addPassword}><fieldset className="account-fields" disabled={!!busy}><PasswordInput id="new-password" label="Add a password" newPassword /><button type="submit" className="button button-dark">{busy === "password" ? "Connecting…" : "Enable email sign-in"}</button></fieldset></form>}</section>
    <section className="account-panel settings-data"><div><h2>Your data, your choice.</h2><p className="account-muted">Download your profile, game stats, saved games and friend connections. To delete your account and public profile, contact us from your account email.</p><a className="text-link" href={`mailto:${supportEmail}?subject=Vihar%20ID%20account%20deletion`}>Request account deletion</a></div><button type="button" className="button button-outline" disabled={!!busy} onClick={() => void run("export", download, "Your account data has been downloaded.")}><Download size={17} aria-hidden="true" />{busy === "export" ? "Preparing…" : "Download my data"}</button></section>
  </>;
}
