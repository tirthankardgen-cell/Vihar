"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import type { PlayerProfile } from "@/lib/account/model";
import { accountError } from "@/lib/account/model";

type AuthState = { user: User | null; profile: PlayerProfile | null; loading: boolean; error: string; retry: () => void };
const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true, error: "", retry: () => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needed = /^\/(login|signup|forgot-password|dashboard|games|community|u|auth)(\/|$)/.test(pathname);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<AuthState, "retry">>({ user: null, profile: null, loading: true, error: "" });
  useEffect(() => {
    let previouslySignedIn = false;
    try { previouslySignedIn = localStorage.getItem("vihar:account") === "1"; } catch { /* Firebase reports storage failures. */ }
    if (!needed && !previouslySignedIn) return;
    let disposed = false;
    let stopAuth: (() => void) | undefined;
    let stopProfile: (() => void) | undefined;
    let generation = 0;
    void Promise.all([import("@/lib/firebase/client"), import("firebase/auth"), import("@/lib/account/data")]).then(([client, sdk, data]) => {
      if (disposed) return;
      const { auth } = client.getFirebase();
      stopAuth = sdk.onIdTokenChanged(auth, (user) => {
        if (disposed) return;
        const current = ++generation;
        stopProfile?.();
        try { if (user) localStorage.setItem("vihar:account", "1"); else localStorage.removeItem("vihar:account"); } catch { /* The hint is optional, never an authorization signal. */ }
        if (!user) { setState({ user: null, profile: null, loading: false, error: "" }); return; }
        // Token refresh and linking a provider must not unmount an existing
        // player's form or erase its success message. A different UID still
        // clears every bit of the previous account before rendering.
        setState((previous) => previous.user?.uid === user.uid
          ? { ...previous, user, error: "" }
          : { user, profile: null, loading: true, error: "" });
        stopProfile = data.watchProfile(user.uid, (profile) => {
          if (!disposed && current === generation) setState({ user, profile, loading: false, error: "" });
        }, (error) => {
          if (!disposed && current === generation) setState({ user, profile: null, loading: false, error: accountError(error) });
        });
      }, (error) => { if (!disposed) setState({ user: null, profile: null, loading: false, error: accountError(error) }); });
    }).catch((error) => { if (!disposed) setState({ user: null, profile: null, loading: false, error: accountError(error) }); });
    return () => { disposed = true; stopAuth?.(); stopProfile?.(); };
  }, [needed, attempt]);
  return <AuthContext.Provider value={{ ...state, retry: () => setAttempt((value) => value + 1) }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
