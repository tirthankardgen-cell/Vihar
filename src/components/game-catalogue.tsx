"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownWideNarrow, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { GameCategories } from "@/components/game-categories";
import { categoryLabel, gameCategories } from "@/lib/game-categories";
import type { Game } from "@/lib/games";

const availabilityOptions = [
  { value: "all", label: "Any status" },
  { value: "playable", label: "Play now" },
  { value: "upcoming", label: "Coming soon" },
] as const;

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "title-asc", label: "Name: A–Z" },
  { value: "title-desc", label: "Name: Z–A" },
  { value: "playable-first", label: "Playable first" },
] as const;

type CatalogueParameter = "q" | "category" | "availability" | "sort";

function updateParameter(key: CatalogueParameter, value: string) {
  const url = new URL(window.location.href);
  const isDefault = ((key === "category" || key === "availability") && value === "all")
    || (key === "sort" && value === "featured");
  if (!value || isDefault) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  if (url.search === window.location.search) return;
  // Native history keeps filters instant and shareable. Typing replaces the
  // current entry; deliberate filter changes can be retraced with Back.
  if (key === "q") window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  else window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function resetCatalogue() {
  const url = new URL(window.location.href);
  for (const key of ["q", "category", "availability", "sort"]) url.searchParams.delete(key);
  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function Catalogue({ games, parameters }: { games: Game[]; parameters?: Pick<URLSearchParams, "get"> }) {
  const category = gameCategories.find(({ id }) => id === parameters?.get("category"))?.id ?? "all";
  const availability = availabilityOptions.find(({ value }) => value === parameters?.get("availability"))?.value ?? "all";
  const sort = sortOptions.find(({ value }) => value === parameters?.get("sort"))?.value ?? "featured";
  const query = parameters?.get("q") ?? "";
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const hasFilters = category !== "all" || availability !== "all" || query.length > 0;
  const hasChanges = hasFilters || sort !== "featured";

  const visible = games.filter((game) => {
    const searchable = [game.title, game.genre, game.description, game.platform, ...game.categories.map(categoryLabel)].join(" ").toLowerCase();
    return (category === "all" || game.categories.includes(category))
      && (availability === "all" || game.status === availability)
      && terms.every((term) => searchable.includes(term));
  });

  if (sort === "title-asc") visible.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "title-desc") visible.sort((a, b) => b.title.localeCompare(a.title));
  if (sort === "playable-first") visible.sort((a, b) => Number(b.status === "playable") - Number(a.status === "playable"));

  const categoryIsEmpty = category !== "all" && !games.some((game) => game.categories.includes(category));

  return (
    <div className="catalogue">
      <h2 className="sr-only">Game collection</h2>
      <GameCategories selected={category} onSelect={(value) => updateParameter("category", value)} />
      <div className="catalogue-toolbar">
        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="game-search">Search games</label>
          <input id="game-search" type="search" value={query} onChange={(event) => updateParameter("q", event.target.value)} placeholder="Search by name or category…" autoComplete="off" />
          {query && <button type="button" aria-label="Clear search" onClick={() => { updateParameter("q", ""); document.getElementById("game-search")?.focus(); }}><X size={16} aria-hidden="true" /></button>}
        </div>
        <div className="catalogue-options">
          <div className="catalogue-select">
            <SlidersHorizontal size={15} aria-hidden="true" />
            <label className="sr-only" htmlFor="game-availability">Filter by availability</label>
            <select id="game-availability" value={availability} onChange={(event) => updateParameter("availability", event.target.value)}>
              {availabilityOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </div>
          <div className="catalogue-select">
            <ArrowDownWideNarrow size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor="game-sort">Sort games</label>
            <select id="game-sort" value={sort} onChange={(event) => updateParameter("sort", event.target.value)}>
              {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="catalogue-summary">
        <p className="results-count" role="status" aria-live="polite" aria-atomic="true">{hasFilters ? `${visible.length} of ${games.length}` : visible.length} {games.length === 1 ? "game" : "games"}{category !== "all" ? ` · ${categoryLabel(category)}` : " to explore"}</p>
        {hasChanges && <button type="button" className="catalogue-reset" onClick={resetCatalogue}>Reset all <X size={13} aria-hidden="true" /></button>}
      </div>
      {visible.length ? (
        <div className="game-grid">{visible.map((game, index) => <GameCard key={game.slug} game={game} eager={index === 0} />)}</div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">✳</span>
          <h3>{categoryIsEmpty ? "Room for something new." : "No games found. Yet."}</h3>
          <p>{categoryIsEmpty ? `${categoryLabel(category)} games will live here as the collection grows.` : "Try another search or give a different category a go."}</p>
          <button type="button" className="button button-dark" onClick={resetCatalogue}>Explore all games</button>
        </div>
      )}
      <p className="catalogue-note">A small collection. Plenty of room to grow.</p>
    </div>
  );
}

function InteractiveCatalogue({ games }: { games: Game[] }) {
  const parameters = useSearchParams();
  return <Catalogue games={games} parameters={parameters} />;
}

export function GameCatalogue({ games }: { games: Game[] }) {
  return <Suspense fallback={<Catalogue games={games} />}><InteractiveCatalogue games={games} /></Suspense>;
}
