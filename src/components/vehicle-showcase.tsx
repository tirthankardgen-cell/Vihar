"use client";

import Image from "next/image";
import { ArrowUpRight, Check, LockKeyhole, Play } from "lucide-react";
import { useId, useState } from "react";
import { rides } from "@/lib/game-showcase";

export function VehicleShowcase({ playUrl }: { playUrl: string }) {
  const [selected, setSelected] = useState(rides[0].id);
  const previewId = useId();
  const ride = rides.find((item) => item.id === selected) ?? rides[0];

  return <div className="bkr-ride-showcase">
    <div className="bkr-ride-preview" id={previewId}>
      <div className="bkr-preview-top"><span>Your sawaari</span><span className={`bkr-badge ${ride.playable ? "bkr-badge-playable" : "bkr-badge-soon"}`}>{ride.playable ? <Check size={12} aria-hidden="true" /> : <LockKeyhole size={12} aria-hidden="true" />}{ride.playable ? "Playable now" : "Coming soon"}</span></div>
      <div className="bkr-ride-image"><Image key={ride.id} src={ride.src} alt={ride.alt} width={512} height={512} sizes="(max-width: 767px) 85vw, 45vw" /></div>
      <div className="bkr-preview-bottom">
        <div aria-live="polite" aria-atomic="true"><p>{ride.type}</p><h3>{ride.name}</h3><span>{ride.line}</span></div>
        {ride.playable && <a href={playUrl} target="_blank" rel="noopener noreferrer" className="bkr-ride-play" aria-label="Drive the auto rickshaw in Mumbai, opens in a new tab"><Play size={15} fill="currentColor" aria-hidden="true" /><ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </div>
    <div className="bkr-ride-options" role="group" aria-label="Preview the rides">
      {rides.map((item) => <button key={item.id} type="button" className="bkr-ride-option" aria-label={`Preview ${item.name}, ${item.playable ? "playable now" : "coming soon"}`} aria-pressed={item.id === selected} aria-controls={previewId} onClick={() => setSelected(item.id)}>
        <Image src={item.src} alt="" width={512} height={512} sizes="(max-width: 767px) 28vw, 16vw" />
        <span className="bkr-ride-name">{item.name}</span>
        <span className="bkr-ride-availability">{item.playable ? <Check size={11} aria-hidden="true" /> : <LockKeyhole size={11} aria-hidden="true" />}{item.playable ? "Playable" : "Coming soon"}</span>
      </button>)}
    </div>
  </div>;
}
