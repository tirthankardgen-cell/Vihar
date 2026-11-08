import assert from "node:assert/strict";
import { test } from "node:test";
import { rankCommunityGames, recommendedGames } from "../src/lib/community-ranking.ts";

test("rankings exclude drafts and unrated games, and resolve rating ties by review count", () => {
  const games = [
    { id: "unrated", title: "Unrated", published: true },
    { id: "draft", title: "Draft", published: false },
    { id: "new", title: "New", published: true },
    { id: "established", title: "Established", published: true },
    { id: "lower", title: "Lower", published: true },
  ];
  const ratings = { draft: { rating: 5, count: 10 }, new: { rating: 4.5, count: 1 }, established: { rating: 4.5, count: 4 }, lower: { rating: 4, count: 20 }, unrated: { rating: null, count: 0 } };
  assert.deepEqual(rankCommunityGames(games, ratings).map((game) => game.id), ["established", "new", "lower"]);
  assert.equal(games[0].id, "unrated", "Ranking must not mutate discovery order");
});

test("rankings return at most five real entries, with a stable order for exact ties", () => {
  const games = Array.from({ length: 7 }, (_, i) => ({ id: String(i), title: `Game ${i}`, published: true }));
  const ratings = Object.fromEntries(games.map((game) => [game.id, { rating: 4, count: 2 }]));
  assert.deepEqual(rankCommunityGames([...games].reverse(), ratings).map((game) => game.id), ["0", "1", "2", "3", "4"]);
  assert.deepEqual(rankCommunityGames(games, {}), []);
});

test("recommendations mix both origins by real ratings and retain unrated discoveries after rated games", () => {
  const originals = [{ slug: "shared-id", title: "VIHAR game" }];
  const community = [{ id: "shared-id", title: "Community game", published: true }, { id: "new", title: "A new game", published: true }];
  const picks = recommendedGames(originals, community, { "officialGames/shared-id": { rating: 4, count: 5 }, "shared-id": { rating: 5, count: 1 } });
  assert.deepEqual(picks.map((item) => [item.source, item.game.title]), [["communityGames", "Community game"], ["officialGames", "VIHAR game"], ["communityGames", "A new game"]]);
});
