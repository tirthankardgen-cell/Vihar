"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, RotateCw, Sparkles } from "lucide-react";
import Link from "@/components/site-link";
import CardFlip from "@/components/ui/card-flip";
import { memberSince, type PlayerProfile } from "@/lib/account/model";
import { Avatar } from "./avatar";
import styles from "./vihar-id-card.module.css";

type ViharIdCardProps = {
  profile: Pick<PlayerProfile, "displayName" | "username" | "avatarId" | "createdAt">;
};

export function ViharIdCard({ profile }: ViharIdCardProps) {
  const [flipped, setFlipped] = useState(false);
  const joined = memberSince(profile.createdAt);
  const profilePath = `/u/${encodeURIComponent(profile.username)}`;

  const brand = <span className={styles.brand}><Image src="/brand/vihar-emblem-inverse.svg" width={20} height={20} alt="" draggable={false} /><span>VIHAR <b>ID</b></span></span>;

  return <div className={styles.stage}>
    <CardFlip
      label={`${profile.displayName}’s Vihar ID`}
      flipped={flipped}
      onFlippedChange={setFlipped}
      className={styles.card}
      front={<div className={styles.front}>
        <div className={styles.top}>{brand}<span className={styles.edition}>PLAYER CARD</span></div>
        <div className={styles.identity}>
          <div className={styles.portrait}><Avatar id={profile.avatarId} size={112} /></div>
          <span className={styles.kicker}>A SPACE TO PLAY</span>
          <strong className={styles.name} data-long-name={profile.displayName.length > 24 || undefined}>{profile.displayName}</strong>
          <span className={styles.username}>@{profile.username}</span>
        </div>
        <div className={styles.bottom}><span>YOUR GAMES. YOUR IDENTITY.</span><Sparkles size={14} aria-hidden="true" /></div>
      </div>}
      back={<div className={styles.back}>
        <div className={styles.top}>{brand}<span className={styles.edition}>THE DETAILS</span></div>
        <div className={styles.backIntro}><Sparkles size={23} aria-hidden="true" /><strong>Your next adventure<br />starts with you.</strong></div>
        <dl className={styles.details}>
          <div><dt>Player</dt><dd>{profile.displayName}</dd></div>
          <div><dt>Vihar username</dt><dd>@{profile.username}</dd></div>
          <div><dt>Member since</dt><dd>{joined}</dd></div>
        </dl>
        <Link href={profilePath} className={styles.profileLink}>
          <span><span>View player profile</span><small>vihar.online/u/{profile.username}</small></span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>}
    />
    <div className={styles.controls}>
      <span>Drag to turn</span>
      <button type="button" onClick={() => setFlipped((value) => !value)} aria-label={`Show ${flipped ? "front" : "back"} of Vihar ID`}><RotateCw size={14} aria-hidden="true" />Flip card</button>
    </div>
  </div>;
}
