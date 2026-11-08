"use client";

import { useEffect, useState } from "react";
import Link from "@/components/site-link";
import { watchProfile } from "@/lib/account/data";
import type { PlayerProfile } from "@/lib/account/model";
import styles from "./game-origin.module.css";

export function CommunityCreator({ ownerId, label = "Published by", initialProfile }: { ownerId: string; label?: string; initialProfile?: Pick<PlayerProfile, "displayName" | "username"> | null }) {
  const [creator, setCreator] = useState<{ ownerId: string; profile: PlayerProfile | null } | null>(null);
  useEffect(() => {
    const receive = (profile: PlayerProfile | null) => setCreator({ ownerId, profile });
    try { return watchProfile(ownerId, receive, () => receive(null)); }
    catch { queueMicrotask(() => receive(null)); }
  }, [ownerId]);
  const ready = creator?.ownerId === ownerId;
  const profile = ready ? creator.profile : initialProfile;
  return <div className={styles.creator}>
    <span>{label}</span>{profile ? <Link href={`/u/${profile.username}`}>{profile.displayName} <span>(@{profile.username})</span></Link> : <span>{ready ? "a community member · profile unavailable" : "a community member"}</span>}
  </div>;
}
