import assert from "node:assert/strict";
import { quickPlayGames, quickPlayOrigin } from "../src/lib/quick-play.ts";

// Read-only release preflight. A live scaffold never promotes itself to playable.
const response = await fetch(`${quickPlayOrigin}/api/games`, { signal: AbortSignal.timeout(20_000) });
assert(response.ok, "Game manifest must be available");
const { games: manifest } = await response.json();
assert(Array.isArray(manifest));
let playable = 0;
for (const game of quickPlayGames) {
  const entry = manifest.find((item) => item.id === game.id);
  assert(entry, `Missing game manifest entry: ${game.id}`);
  assert.equal(new URL(entry.playPath, quickPlayOrigin).href, game.embedUrl, `${game.id}: verify the individual route`);
  const page = await fetch(game.embedUrl, { signal: AbortSignal.timeout(20_000), redirect: "manual" });
  assert.equal(page.status, 200, `${game.id}: game route must resolve without redirects`);
  await page.body?.cancel();
  if (game.release.status === "playable") {
    playable++;
    assert.equal(entry.availability, "playable", `${game.id}: a scaffold is not gameplay`);
    assert.equal(entry.embedVersion, 1, `${game.id}: confirm the versioned UI bridge`);
    assert(game.release.modes.every((mode) => entry.availableModes.includes(mode)), `${game.id}: modes must be deployed`);
    const csp = page.headers.get("content-security-policy") || "";
    assert(/frame-ancestors\s+[^;]*https:\/\/vihar\.online(?:\s|;|$)/.test(csp), `${game.id}: host must allow the exact Vihar parent`);
    assert(!page.headers.has("x-frame-options"), `${game.id}: a conflicting frame restriction blocks play`);
  }
  console.log(`${game.id}: route verified; host ${entry.availability}; Vihar ${game.release.status}`);
}
console.log(`PASS: ${quickPlayGames.length} individual routes verified, ${playable} enabled releases. Gameplay and browser integration still require per-release verification.`);
