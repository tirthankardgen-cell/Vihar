"use client";

import { useEffect, useState } from "react";
import { Check, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import Link from "@/components/site-link";
import { acceptFriendRequest, profileByUsername, removeFriendship, sendFriendRequest, watchFriends, watchProfile } from "@/lib/account/data";
import { accountError, normalizeUsername, usernameError, type Friendship, type PlayerProfile } from "@/lib/account/model";
import { useAuth } from "./auth-provider";
import { useAccountData } from "./account-shell";
import { Avatar } from "./avatar";
import { ShareProfile } from "./share-profile";

export function FriendButton({ player }: { player: PlayerProfile }) {
  const { user, profile, loading } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState<{ uid: string; items: Friendship[]; ready: boolean } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (!uid) return;
    return watchFriends(uid, (items) => setState({ uid, items, ready: true }), (failure) => setError(accountError(failure)));
  }, [uid]);
  const friends = state?.uid === uid ? state : null;
  const existing = friends?.items.find((item) => item.members.includes(player.uid));
  async function action() {
    if (!user) return;
    setBusy(true); setError("");
    try {
      if (!existing) await sendFriendRequest(user.uid, player.uid);
      else if (existing.status === "pending" && existing.to === user.uid) await acceptFriendRequest(existing.id);
      else await removeFriendship(existing.id);
    } catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  if (loading) return <span className="account-muted">Checking your account…</span>;
  if (!user) return <Link className="button button-dark" href={`/login?next=${encodeURIComponent(`/u/${player.username}`)}`}><UserPlus size={17} aria-hidden="true" />Sign in to add friend</Link>;
  if (user.uid === player.uid) return <Link className="button button-dark" href="/dashboard/settings">Edit your profile</Link>;
  if (!profile) return <Link className="button button-dark" href="/dashboard">Finish your Vihar ID to add friends</Link>;
  return <div className="friend-action"><button type="button" className={`button ${existing ? "button-outline" : "button-dark"}`} disabled={busy || !friends?.ready || (!user.emailVerified && existing?.status !== "accepted" && existing?.from !== user.uid)} onClick={() => void action()}>{existing?.status === "accepted" ? <UserMinus size={17} aria-hidden="true" /> : <UserPlus size={17} aria-hidden="true" />}{busy ? "Please wait…" : existing?.status === "accepted" ? "Remove friend" : existing ? existing.from === user.uid ? "Cancel request" : "Accept request" : "Add friend"}</button>{!user.emailVerified && <p className="account-muted">Verify your email from your dashboard to add friends.</p>}{error && <p className="account-error" role="alert">{error}</p>}</div>;
}
function FriendRow({ friendship }: { friendship: Friendship }) {
  const { user } = useAuth();
  const other = friendship.from === user!.uid ? friendship.to : friendship.from;
  const incoming = friendship.to === user!.uid && friendship.status === "pending";
  const [profile, setProfile] = useState<PlayerProfile | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => watchProfile(other, setProfile, (failure) => setError(accountError(failure))), [other]);
  async function action(accept: boolean) {
    setBusy(true); setError("");
    try { if (accept) await acceptFriendRequest(friendship.id); else await removeFriendship(friendship.id); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  return <li className="friend-row"><Avatar id={profile?.avatarId || "sun"} size={52} /><div className="friend-row-name">{profile ? <Link href={`/u/${profile.username}`}><strong>{profile.displayName}</strong><span>@{profile.username}</span></Link> : <span>Player profile unavailable</span>}{error && <p className="account-error" role="alert">{error}</p>}</div><div className="friend-row-actions">{incoming && <button type="button" className="button button-dark" disabled={busy || !user?.emailVerified} onClick={() => void action(true)}><Check size={15} aria-hidden="true" />Accept<span className="sr-only"> {profile?.username || "friend request"}</span></button>}<button type="button" className="quiet-button" disabled={busy} onClick={() => void action(false)}>{friendship.status === "accepted" ? <UserMinus size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}{incoming ? "Decline" : friendship.status === "accepted" ? "Remove" : "Cancel"}<span className="sr-only"> {profile?.username || "friend request"}</span></button></div></li>;
}
export function FriendsDashboard() {
  const { user, profile } = useAuth();
  const { friendships, loading } = useAccountData();
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<{ value: string; player: PlayerProfile | null } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = normalizeUsername(username);
    const validation = usernameError(value);
    if (validation) { setError(validation); return; }
    setBusy(true); setError(""); setResult(null);
    try { setResult({ value, player: await profileByUsername(value) }); }
    catch (failure) { setError(accountError(failure)); } finally { setBusy(false); }
  }
  const accepted = friendships.filter((item) => item.status === "accepted");
  const incoming = friendships.filter((item) => item.status === "pending" && item.to === user!.uid);
  const outgoing = friendships.filter((item) => item.status === "pending" && item.from === user!.uid);
  return <><div className="dashboard-heading"><div><p className="eyebrow">Better with your people</p><h1>Your <em>friends.</em></h1><p className="account-muted">Find players, share profiles and build your community.</p></div><ShareProfile username={profile!.username} /></div><section className="account-panel friend-search"><h2>Find your people</h2><p className="account-muted">Enter their exact Vihar username to find their profile.</p><form onSubmit={(event) => void search(event)}><label className="account-field" htmlFor="friend-username"><span className="sr-only">Friend’s username</span><span className="username-input"><span aria-hidden="true">@</span><input id="friend-username" value={username} onChange={(event) => { setUsername(event.target.value); setResult(null); }} placeholder="their_username" required maxLength={21} autoCapitalize="none" spellCheck={false} /></span></label><button type="submit" className="button button-dark" disabled={busy}><Search size={17} aria-hidden="true" />{busy ? "Searching…" : "Find player"}</button></form>{error && <p className="account-error" role="alert">{error}</p>}{result && (result.player ? <div className="friend-search-result"><Avatar id={result.player.avatarId} size={64} /><Link href={`/u/${result.player.username}`}><strong>{result.player.displayName}</strong><span>@{result.player.username}</span></Link><FriendButton key={result.player.uid} player={result.player} /></div> : <p className="account-muted" role="status">No player found with @{result.value}. Check the spelling and try again.</p>)}</section>
    {loading ? <p className="account-muted" role="status">Finding your friends…</p> : <>{incoming.length > 0 && <section className="dashboard-section"><div className="account-section-heading"><h2>Requests for you <span className="count-label">{incoming.length}</span></h2></div><ul className="friend-list">{incoming.map((item) => <FriendRow key={item.id} friendship={item} />)}</ul></section>}<section className="dashboard-section"><div className="account-section-heading"><h2>Your friends <span className="count-label">{accepted.length}</span></h2></div>{accepted.length ? <ul className="friend-list">{accepted.map((item) => <FriendRow key={item.id} friendship={item} />)}</ul> : <div className="account-empty friends-empty"><Users size={32} aria-hidden="true" /><h2>Build your circle.</h2><p>Find a friend by username, or share your profile so they can find you. You both choose to connect.</p><ShareProfile username={profile!.username} compact /></div>}</section>{outgoing.length > 0 && <section className="dashboard-section"><div className="account-section-heading"><h2>Sent requests <span className="count-label">{outgoing.length}</span></h2></div><ul className="friend-list">{outgoing.map((item) => <FriendRow key={item.id} friendship={item} />)}</ul></section>}</>}
  </>;
}
