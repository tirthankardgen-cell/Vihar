import type { CommunityGame } from "./community";
import type { Game } from "./games";

export type RatingSummary = { rating: number | null; count: number };
export function rankCommunityGames(games: CommunityGame[], ratings: Record<string, RatingSummary>) {
  return games.filter((game) => game.published && ratings[game.id]?.count > 0 && Number.isFinite(ratings[game.id].rating))
    .sort((a, b) => (ratings[b.id].rating! - ratings[a.id].rating!) || (ratings[b.id].count - ratings[a.id].count) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))
    .slice(0, 5);
}

export type Recommendation = { source: "officialGames"; game: Game } | { source: "communityGames"; game: CommunityGame };
export function recommendationKey(item: Recommendation) { return item.source === "officialGames" ? `officialGames/${item.game.slug}` : item.game.id; }
export function recommendedGames(originals: Game[], community: CommunityGame[], ratings: Record<string, RatingSummary>): Recommendation[] {
  const items: Recommendation[] = [...originals.map((game) => ({ source: "officialGames" as const, game })), ...community.filter((game) => game.published).map((game) => ({ source: "communityGames" as const, game }))];
  return items.sort((a, b) => (ratings[recommendationKey(b)]?.rating ?? 0) - (ratings[recommendationKey(a)]?.rating ?? 0) || (ratings[recommendationKey(b)]?.count ?? 0) - (ratings[recommendationKey(a)]?.count ?? 0) || a.game.title.localeCompare(b.game.title)).slice(0, 8);
}
