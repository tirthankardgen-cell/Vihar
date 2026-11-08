import { ViharAttribution } from "@/components/game-origin";
import { RatingBadge } from "@/components/rating-badge";
import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowUpRight } from "lucide-react";
import { categoryLabel } from "@/lib/game-categories";
import type { Game } from "@/lib/games";

export function GameCard({ game, eager = false }: { game: Game; eager?: boolean }) {
  return (
    <article className={`game-card game-card-${game.status}`}>
      <Link href={`/games/${game.slug}`} className="game-card-link">
        <Image src={game.artwork} alt={game.artworkAlt} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 767px) calc(50vw - 32px), (max-width: 1100px) calc(50vw - 44px), (max-width: 1376px) calc(50vw - 60px), 628px" />
        <div className="game-card-topline">
          <span className={`status-badge ${game.status === "playable" ? "status-available" : "status-upcoming"}`}>
            <span className="status-dot" aria-hidden="true" />{game.status === "playable" ? "Playable now" : "Coming soon"}
          </span>
          <span className="game-card-artwork-label">{game.artworkLabel}</span>
        </div>
        <RatingBadge id={game.slug} source="officialGames" upcoming={game.status !== "playable"} />
        <div className="game-card-content">
          <p className="game-card-category">{game.categories.length ? game.categories.slice(0, 2).map(categoryLabel).join(" · ") : game.genre}</p>
          <h3>{game.title}</h3>
          <p className="game-card-description">{game.description}</p>
        </div>
        <span className="card-image-arrow" aria-hidden="true"><ArrowUpRight size={21} /></span>
      </Link>
      <ViharAttribution />
    </article>
  );
}
