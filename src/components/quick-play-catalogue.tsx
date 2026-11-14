"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { QuickPlayCard } from "./quick-play-card";
import type { QuickPlayGame } from "@/lib/quick-play";
import styles from "./quick-play-catalogue.module.css";
import cards from "./quick-play.module.css";

export function QuickPlayCatalogue({ games }: { games: QuickPlayGame[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All games");
  const [playableOnly, setPlayableOnly] = useState(false);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = games.filter((game) => (genre === "All games" || game.genre === genre)
    && (!playableOnly || game.release.status === "playable")
    && terms.every((term) => `${game.title} ${game.description} ${game.genre}`.toLowerCase().includes(term)));
  const released = games.filter((game) => game.release.status === "playable").length;
  const reset = () => { setQuery(""); setGenre("All games"); setPlayableOnly(false); };
  return <section aria-label="Browse Quick Play" className={styles.catalogue}>
    <div className={styles.toolbar}>
      <div className={styles.filters} role="group" aria-label="Quick Play categories">{["All games", "Board & Table", "Puzzles & Quick Play", "Arcade"].map((label) => <button key={label} type="button" aria-pressed={genre === label} onClick={() => setGenre(label)}>{label}</button>)}</div>
      <div className="search-field"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="quick-play-search">Search Quick Play</label><input id="quick-play-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next game…" /></div>
    </div>
    <div className={styles.summary}><p role="status">{visible.length} {visible.length === 1 ? "game" : "games"}{released ? ` · ${released} ready to play` : " · A collection in the making"}</p><label><input type="checkbox" checked={playableOnly} onChange={(event) => setPlayableOnly(event.target.checked)} />Ready to play</label></div>
    {visible.length ? <div className={cards.grid}>{visible.map((game, index) => <QuickPlayCard key={game.id} game={game} eager={index < 3} />)}</div> : <div className="empty-state"><h3>{playableOnly && !released ? "Good games are on their way." : "No games found."}</h3><p>{playableOnly && !released ? "Explore the collection while we get the first games ready." : "Try another name or choose a different category."}</p><button type="button" className="button button-outline" onClick={reset}>Show the collection</button></div>}
  </section>;
}
