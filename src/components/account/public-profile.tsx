"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Download, Sparkles } from "lucide-react";
import Link from "@/components/site-link";
import { profileByUsername, watchProfile, watchStats } from "@/lib/account/data";
import { accountError, memberSince, type GameStats, type PlayerProfile } from "@/lib/account/model";
import { Avatar } from "./avatar";
import { AccountLoading } from "./account-shell";
import { StatTiles } from "./dashboard";
import { FriendButton } from "./friends";
import { ShareProfile } from "./share-profile";

export function PublicProfile({ username }: { username: string }) {
  const [state, setState] = useState<{ username: string; profile: PlayerProfile | null; stats: GameStats[]; loading: boolean; error: string }>({ username, profile: null, stats: [], loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let stopProfile: (() => void) | undefined, stopStats: (() => void) | undefined;
    const fail = (failure: unknown) => { if (active) setState((previous) => ({ ...previous, username, loading: false, error: accountError(failure) })); };
    void profileByUsername(username).then((profile) => {
      if (!active) return;
      setState({ username, profile, stats: [], loading: false, error: "" });
      if (!profile) return;
      stopProfile = watchProfile(profile.uid, (updated) => { if (active) setState((previous) => ({ ...previous, profile: updated })); }, fail);
      stopStats = watchStats(profile.uid, (stats) => { if (active) setState((previous) => ({ ...previous, stats })); }, fail);
    }).catch(fail);
    return () => { active = false; stopProfile?.(); stopStats?.(); };
  }, [username, attempt]);
  if (state.loading || state.username !== username) return <AccountLoading title="Loading player profile…" />;
  if (state.error) return <div className="account-loading container"><h1>Couldn’t open this profile.</h1><p className="account-error" role="alert">{state.error}</p><button type="button" className="button button-dark" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>;
  if (!state.profile) return <div className="account-loading container"><h1>No player here. <em>Yet.</em></h1><p className="account-muted">We couldn’t find @{username}. Check the username or head back to your own space.</p><Link className="button button-dark" href="/dashboard">Go to Vihar ID <ArrowUpRight size={16} aria-hidden="true" /></Link></div>;
  const { profile, stats } = state;
  return <div className="public-profile-wrap container"><section className="public-profile-card"><div className="public-profile-cover" aria-hidden="true"><span>VIHAR ID</span><span>PLAY. CONNECT. REPEAT.</span></div><div className="public-profile-identity"><Avatar id={profile.avatarId} size={124} /><p className="eyebrow">Vihar player</p><h1>{profile.displayName}</h1><p className="public-username">@{profile.username}</p>{profile.bio && <p className="public-bio">{profile.bio}</p>}<p className="public-member"><CalendarDays size={15} aria-hidden="true" />Member since {memberSince(profile.createdAt)}</p><div className="public-profile-actions"><FriendButton player={profile} /><ShareProfile username={profile.username} /><a className="button button-outline" href={`/u/${profile.username}/card?v=${profile.updatedAt?.toMillis() || 0}`} download={`vihar-${profile.username}-id.png`}><Download size={16} aria-hidden="true" />Download ID card</a></div></div><div className="public-profile-stats"><StatTiles stats={stats} /><p className="stats-note">Play stats appear here as games connect to Vihar ID.</p></div><div className="public-profile-bottom"><span><Sparkles size={17} aria-hidden="true" />Your games. Your identity.</span><Link href="/signup">Create your Vihar ID <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section><p className="public-profile-footnote">A space to play. Built for players.</p></div>;
}
