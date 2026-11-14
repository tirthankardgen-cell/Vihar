import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "./site-link";
import { ViharAttribution } from "./game-origin";
import { RatingBadge } from "./rating-badge";
import { quickPlayModes, type QuickPlayGame } from "@/lib/quick-play";
import styles from "./quick-play.module.css";

export function QuickPlayCard({ game, eager = false }: { game: QuickPlayGame; eager?: boolean }) {
  const veranda = game.id === "carrom";
  return <article className={styles.card} style={veranda ? { background: "#173d3a", color: "#f7edda", borderColor: "#d9b87955", "--muted": "#d9ceb8" } as React.CSSProperties : undefined}>
    <Link href={`/games/${game.id}`} className={styles.cardLink}>
      <div className={styles.cardArt}>
        <Image src={game.artwork} alt={game.artworkAlt} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 410px" />
        <span className={`${styles.status} ${game.release.status === "playable" ? styles.playable : ""}`}>{game.release.status === "playable" ? "Play here" : "Coming soon"}</span>
      </div>
      <div className={styles.cardCopy}><span className={styles.genre} style={veranda ? { color: "#dcc49b" } : undefined}>{veranda ? "The Veranda Club" : game.genre}</span><h3>{game.title}<ArrowUpRight size={19} aria-hidden="true" /></h3><p>{game.description}</p>
        {game.release.status === "playable" && <div className={styles.modes}>{game.release.modes.map((mode) => <span key={mode} style={veranda ? { color: "#f5e6c5", borderColor: "#dfb36d70" } : undefined}>{quickPlayModes[mode]}</span>)}</div>}
      </div>
    </Link>
    <div className={styles.cardFooter}><ViharAttribution /><RatingBadge id={game.id} source="officialGames" upcoming={game.release.status !== "playable"} /></div>
  </article>;
}
