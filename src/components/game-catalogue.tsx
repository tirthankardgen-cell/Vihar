"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { GameCard } from "@/components/game-card";
import type { Game } from "@/lib/games";

type Filter = "all" | "playable" | "upcoming";

export function GameCatalogue({ games }: { games: Game[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const visible = games.filter((game) => (filter === "all" || game.status === filter) && `${game.title} ${game.genre} ${game.description}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="catalogue">
      <h2 className="sr-only">Game collection</h2>
      <div className="catalogue-toolbar">
        <div className="filter-group" role="group" aria-label="Filter games by availability">
          {([{ value: "all", label: "All games" }, { value: "playable", label: "Play now" }, { value: "upcoming", label: "Coming soon" }] as const).map(({ value, label }) => <button type="button" key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}<span>{games.filter((game) => value === "all" || game.status === value).length}</span></button>)}
        </div>
        <div className="search-field"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="game-search">Search games</label><input id="game-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a little escape…" autoComplete="off" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={15} aria-hidden="true" /></button>}</div>
      </div>
      <p className="results-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? "world" : "worlds"} to discover{filter === "upcoming" ? " · Something to look forward to." : "."}</p>
      {visible.length > 0 ? <div className="game-grid">{visible.map((game) => <GameCard key={game.slug} game={game} />)}</div> : <div className="empty-state"><span aria-hidden="true">✳</span><h2>No worlds found. Yet.</h2><p>Try a different name or explore the whole collection.</p><button type="button" className="button button-dark" onClick={() => { setQuery(""); setFilter("all"); }}>Show all games</button></div>}
    </div>
  );
}
