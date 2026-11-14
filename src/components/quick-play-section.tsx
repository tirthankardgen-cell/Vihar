import { ArrowUpRight, Dices } from "lucide-react";
import Link from "./site-link";
import { QuickPlayCard } from "./quick-play-card";
import { quickPlayGames } from "@/lib/quick-play";
import styles from "./quick-play.module.css";

export function QuickPlaySection() {
  const released = quickPlayGames.filter((game) => game.release.status === "playable");
  const selection = released.length ? released.slice(0, 3) : ["chess", "carrom", "tic-tac-toe"].map((id) => quickPlayGames.find((game) => game.id === id)!);
  return <section className={styles.section} aria-labelledby="quick-play-title">
    <div className={styles.sectionHeading}><div><p className="eyebrow"><Dices size={16} aria-hidden="true" /> Free browser board games &amp; puzzles</p><h2 id="quick-play-title">A little strategy.<br /><em>A lot of play.</em></h2><p>{released.length ? "Play free browser board games in Quick Play. Try Carrom, Chess or Tic-Tac-Toe against the computer or share a device with a friend. Upcoming games are clearly marked." : "Meet Quick Play. Twelve board favourites and thoughtful puzzles, coming to Vihar."}</p></div><Link className="text-link" href="/games/quick-play">Explore Quick Play <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    <div className={styles.grid}>{selection.map((game) => <QuickPlayCard key={game.id} game={game} />)}</div>
  </section>;
}
