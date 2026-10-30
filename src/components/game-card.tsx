import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Monitor } from "lucide-react";
import type { Game } from "@/lib/games";

export function GameCard({ game }: { game: Game }) {
  return (
    <article className={`game-card game-card-${game.status}`}>
      <Link href={`/games/${game.slug}`} className="game-card-image-link" aria-label={`Discover ${game.title}. ${game.status === "playable" ? "Playable now" : "Coming soon"} Concept artwork.`}>
        <div className="game-card-image">
          <Image src={game.artwork} alt={game.artworkAlt} fill sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 767px) calc(50vw - 31px), (max-width: 1100px) calc(50vw - 48px), (max-width: 1376px) calc(50vw - 64px), 624px" />
          <span className={`status-badge ${game.status === "playable" ? "status-available" : "status-upcoming"}`}>
            <span className="status-dot" aria-hidden="true" />{game.status === "playable" ? "Playable now" : "Coming soon"}
          </span>{" "}
          <span className="artwork-label">Concept artwork</span>
          <span className="card-image-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
        </div>
      </Link>
      <div className="game-card-meta"><span>{game.genre}</span><span><Monitor size={13} aria-hidden="true" />{game.platform}</span></div>
      <h3><Link href={`/games/${game.slug}`}>{game.title} <ArrowUpRight size={24} aria-hidden="true" /></Link></h3>
      <p>{game.description}</p>
    </article>
  );
}
