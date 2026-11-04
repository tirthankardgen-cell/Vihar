import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyGameDetails, validateGameDetails } from "../src/lib/game-publishing.ts";
const draft = { ...emptyGameDetails, title: " Orbit ", description: "Explore space", url: "https://games.example.com/" };
test("drafts can be incomplete while publishing requires imagery and instructions", () => {
  assert.equal(validateGameDetails(draft, false).title, "Orbit");
  assert.throws(() => validateGameDetails(draft, true), /cover image/);
  const ready = { ...draft, coverUrl: "https://images.example.com/cover.jpg", howToPlay: "Find the stars" };
  assert.equal(validateGameDetails(ready, true).howToPlay, "Find the stars");
  assert.throws(() => validateGameDetails({ ...ready, screenshots: ["javascript:alert(1)"] }, true));
  assert.throws(() => validateGameDetails({ ...ready, screenshots: Array(7).fill(ready.coverUrl) }, true), /six/);
  assert.throws(() => validateGameDetails({ ...draft, url: "https://user:pass@example.com/" }, false));
  assert.throws(() => validateGameDetails({ ...draft, description: "x".repeat(2001) }, false), /too long/);
});
