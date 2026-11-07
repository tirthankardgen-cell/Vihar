"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { reload, sendEmailVerification, signOut } from "firebase/auth";
import { ArrowUpRight, Gamepad2, LayoutGrid, LogOut, Mail, Settings, Users } from "lucide-react";
import Link from "@/components/site-link";
import { getFirebase } from "@/lib/firebase/client";
import { watchActivity, watchFavorites, watchFriends, watchStats } from "@/lib/account/data";
import { accountError, type Friendship, type GameLaunch, type GameStats } from "@/lib/account/model";
import { useAuth } from "./auth-provider";
import { Avatar } from "./avatar";
import { Onboarding } from "./onboarding";

type AccountData = { stats: GameStats[]; activity: GameLaunch[]; favorites: string[]; friendships: Friendship[]; loading: boolean; error: string };
const DataContext = createContext<AccountData>({ stats: [], activity: [], favorites: [], friendships: [], loading: true, error: "" });
export function useAccountData() { return useContext(DataContext); }
export function AccountLoading({ title = "Loading your Vihar ID…" }: { title?: string }) { return <div className="account-loading container" role="status"><span className="account-loading-spark" aria-hidden="true">✳</span><h1>{title}</h1><p className="account-muted">Getting your account ready.</p></div>; }
export function VerificationBanner() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [sentAt, setSentAt] = useState(0);
  async function verify(check: boolean) {
    if (!user) return;
    setBusy(true); setMessage("");
    try {
      if (check) { await reload(user); await user.getIdToken(true); setMessage(user.emailVerified ? "Email verified." : "Not verified yet. Open the link in your email, then check again."); }
      else if (Date.now() - sentAt < 60000) setMessage("A verification email was just sent. Wait a minute before resending.");
      else { await sendEmailVerification(user, { url: `${window.location.origin}/dashboard` }); setSentAt(Date.now()); setMessage("Verification email sent. Check your inbox and spam folder."); }
    } catch (failure) { setMessage(accountError(failure)); } finally { setBusy(false); }
  }
  if (!user || user.emailVerified) return null;
  return <div className="verification-banner"><Mail size={20} aria-hidden="true" /><div><p>One last thing: verify your email.</p><span>Open the link in your inbox to start adding friends.</span>{message && <p role="status">{message}</p>}</div><div className="verification-actions"><button type="button" onClick={() => void verify(false)} disabled={busy}>Resend email</button><button type="button" onClick={() => void verify(true)} disabled={busy}>I’ve verified</button></div></div>;
}
function AccountBody({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const uid = user!.uid;
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<AccountData & { uid: string }>({ uid, stats: [], activity: [], favorites: [], friendships: [], loading: true, error: "" });
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    let active = true;
    const loaded = new Set<string>();
    const publish = (key: "stats" | "activity" | "favorites" | "friendships", value: GameStats[] | GameLaunch[] | string[] | Friendship[]) => {
      if (!active) return;
      loaded.add(key);
      setData((previous) => ({ ...previous, uid, [key]: value, loading: loaded.size < 4 }));
    };
    const fail = (failure: unknown) => { if (active) setData((previous) => ({ ...previous, uid, loading: false, error: accountError(failure) })); };
    const stop = [watchStats(uid, (value) => publish("stats", value), fail), watchActivity(uid, (value) => publish("activity", value), fail), watchFavorites(uid, (value) => publish("favorites", value), fail), watchFriends(uid, (value) => publish("friendships", value), fail)];
    return () => { active = false; stop.forEach((unsubscribe) => unsubscribe()); };
  }, [uid]);
  const incoming = data.friendships.filter((friend) => friend.status === "pending" && friend.to === uid).length;
  async function logout() {
    setSigningOut(true); setLogoutError("");
    try { await signOut(getFirebase().auth); router.replace("/login"); }
    catch (failure) { setLogoutError(accountError(failure)); setSigningOut(false); }
  }
  const links = [{ href: "/dashboard", label: "Overview", Icon: LayoutGrid }, { href: "/dashboard/games", label: "My games", Icon: Gamepad2 }, { href: "/dashboard/publish", label: "Creator studio", Icon: Gamepad2 }, { href: "/dashboard/friends", label: "Friends", Icon: Users }, { href: "/dashboard/settings", label: "Account", Icon: Settings }];
  return <DataContext.Provider value={data}><div className="dashboard-layout container"><aside className="dashboard-sidebar" tabIndex={0} aria-label="Dashboard navigation"><Link href={`/u/${profile!.username}`} className="sidebar-profile"><Avatar id={profile!.avatarId} size={60} /><span><strong>{profile!.displayName}</strong><span>@{profile!.username}</span></span></Link><p className="eyebrow sidebar-label">Player hub</p><nav aria-label="Your account">{links.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={18} aria-hidden="true" />{label}{label === "Friends" && incoming > 0 && <span className="friend-count" aria-label={`${incoming} incoming requests`}>{incoming}</span>}</Link>)}</nav><div className="sidebar-bottom"><Link href="/games">Explore Vihar <ArrowUpRight size={15} aria-hidden="true" /></Link><button type="button" onClick={() => void logout()} disabled={signingOut}><LogOut size={16} aria-hidden="true" />{signingOut ? "Signing out…" : "Sign out"}</button>{logoutError && <p className="account-error" role="alert">{logoutError}</p>}</div></aside><div className="dashboard-main" tabIndex={0} role="region" aria-label="Dashboard content"><VerificationBanner />{data.error && <div className="account-error" role="alert">Your account data couldn’t load. {data.error} <button type="button" className="quiet-button" onClick={() => window.location.reload()}>Retry</button></div>}{children}</div></div></DataContext.Provider>;
}
export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, error, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && !user && !error) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [user, loading, error, router, pathname]);
  if (error) return <div className="account-loading container"><h1>Your space is a moment away.</h1><p className="account-error" role="alert">{error}</p><button type="button" className="button button-dark" onClick={retry}>Try again</button></div>;
  if (loading || !user) return <AccountLoading />;
  if (!profile) return <Onboarding />;
  return <AccountBody key={user.uid}>{children}</AccountBody>;
}
