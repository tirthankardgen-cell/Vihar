import { ArrowUpRight, Dices } from "lucide-react";
import Link from "./site-link";
import { QuickPlayCard } from "./quick-play-card";
import { quickPlayGames } from "@/lib/quick-play";
import styles from "./quick-play.module.css";

export function QuickPlaySection() {
  const released = quickPlayGames.filter((game) => game.release.status === "playable");
  const selection = released.length ? released : ["chess", "carrom", "tic-tac-toe"].map((id) => quickPlayGames.find((game) => game.id === id)!);
  return <section className={styles.section} aria-labelledby="quick-play-title">
    <div className={styles.sectionHeading}><div><p className="eyebrow"><Dices size={16} aria-hidden="true" /> New games every week</p><h2 id="quick-play-title">A little strategy.<br /><em>A lot of play.</em></h2><p>Play free board games, puzzles and arcade favourites in your browser. Try Chess, Carrom, Tic-Tac-Toe, Paperwing and Sudoku today, and come back each week for something new.</p></div><Link className="text-link" href="/games/quick-play">Explore Quick Play <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    <div className={styles.grid}>{selection.map((game) => <QuickPlayCard key={game.id} game={game} />)}</div>
  </section>;
}
