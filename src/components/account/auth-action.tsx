"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applyActionCode, confirmPasswordReset, reload, verifyPasswordResetCode } from "firebase/auth";
import { MailCheck } from "lucide-react";
import Link from "@/components/site-link";
import { accountError } from "@/lib/account/model";
import { getFirebase } from "@/lib/firebase/client";
import { PasswordInput } from "./auth-form";

// Deduplicate consumed verification codes across React Strict Mode's effect replay.
const verifications = new Map<string, Promise<void>>();
export function AuthAction() {
  const params = useSearchParams();
  const mode = params.get("mode"), code = params.get("oobCode");
  const [state, setState] = useState({ busy: true, email: "", complete: false, error: "" });
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!code || !["verifyEmail", "resetPassword"].includes(mode || "")) throw Object.assign(new Error("Invalid link"), { code: "auth/invalid-action-code" });
      const { auth } = getFirebase();
      if (mode === "resetPassword") {
        const email = await verifyPasswordResetCode(auth, code);
        if (active) setState({ busy: false, email, complete: false, error: "" });
      } else {
        let verification = verifications.get(code);
        if (!verification) { verification = applyActionCode(auth, code); verifications.set(code, verification); }
        await verification;
        // An email link can arrive before persisted authentication is restored.
        // Wait for it before refreshing the claim used by Firestore rules.
        await auth.authStateReady();
        const user = auth.currentUser;
        if (user) { await reload(user); await user.getIdToken(true); }
        if (active) setState({ busy: false, email: "", complete: true, error: "" });
      }
    })().catch((failure) => { if (active) setState({ busy: false, email: "", complete: false, error: accountError(failure) }); });
    return () => { active = false; };
  }, [mode, code]);
  async function reset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password"));
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { setState((previous) => ({ ...previous, error: "Include a letter and a number in your password." })); return; }
    setState((previous) => ({ ...previous, busy: true, error: "" }));
    try { await confirmPasswordReset(getFirebase().auth, code!, password); setState({ busy: false, email: "", complete: true, error: "" }); }
    catch (failure) { setState((previous) => ({ ...previous, busy: false, error: accountError(failure) })); }
  }
  return <div className="onboarding-wrap container"><section className="onboarding-card auth-action-card"><MailCheck size={38} aria-hidden="true" /><p className="eyebrow">Your Vihar ID</p><h1>{state.complete ? mode === "verifyEmail" ? "You’re verified." : "A fresh start." : mode === "resetPassword" ? "Choose a new password." : "Checking your link…"}</h1>{state.busy && <p className="account-muted" role="status">Please wait…</p>}{state.complete && <><p className="account-muted">{mode === "verifyEmail" ? "Your email is verified. You’re ready to find your people." : "Password updated. Sign in with your new password."}</p><Link href={mode === "verifyEmail" ? "/dashboard" : "/login"} className="button button-dark">{mode === "verifyEmail" ? "Go to my dashboard" : "Sign in"}</Link></>}{state.email && !state.complete && <form onSubmit={(event) => void reset(event)}><p className="account-muted">For {state.email}</p><fieldset className="account-fields" disabled={state.busy}><PasswordInput newPassword /><button type="submit" className="button button-dark account-submit">Save new password</button></fieldset></form>}{state.error && <><p className="account-error" role="alert">{state.error}</p><Link href={mode === "resetPassword" ? "/forgot-password" : "/dashboard"} className="text-link">Request a new email</Link></>}</section></div>;
}
