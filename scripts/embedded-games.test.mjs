import assert from "node:assert/strict";
import test from "node:test";
import { quickPlayGames, quickPlayOrigin } from "../src/lib/quick-play.ts";
import { assertQuickPlayRelease, buildEmbedUrl, embedMessage, readGameEmbedMessage } from "../src/lib/embedded-games.ts";
import { safeReturnPath } from "../src/lib/account/model.ts";

const fixture = { ...quickPlayGames.find((game) => game.id === "chess"), release: { status: "playable", verifiedAt: "2026-11-09T00:00:00+05:30", modes: ["pass-and-play"], devices: ["Desktop"], controls: "Select a piece and a legal square." } };
const session = "a-valid-session-12345";
const windowRef = {};
const event = (extra = {}) => ({ origin: quickPlayOrigin, source: windowRef, data: { channel: "vihar:embed", version: 1, gameId: fixture.id, sessionId: session, type: "ready" }, ...extra });

test("embed messages require the exact frame, origin, version, game, session and schema", () => {
  const read = (value, target = windowRef) => readGameEmbedMessage(value, fixture, session, target);
  assert.equal(read(event()).type, "ready");
  for (const extra of [{ origin: "https://games.vihr.online" }, { origin: "https://games.vihar.online.evil.example" }, { source: {} }, { source: null }]) assert.equal(read(event(extra)), null);
  assert.equal(read(event(), null), null);
  for (const data of [null, [], "ready", { ...event().data, version: 2 }, { ...event().data, gameId: "ludo" }, { ...event().data, sessionId: "stale-frame-session" }, { ...event().data, type: "navigate" }, { ...event().data, url: "https://evil.example" }, { ...event().data, type: "error", code: "arbitrary-text" }]) assert.equal(read(event({ data })), null);
  for (const type of ["exit", "stopped"]) assert.equal(read(event({ data: { ...event().data, type } })).type, type);
  assert.equal(read(event({ data: { ...event().data, type: "error", code: "load_failed" } })).code, "load_failed");
});

test("launches use an allowlisted individual URL and accept only a one-use fragment ticket", () => {
  const ticket = "a".repeat(43);
  const url = new URL(buildEmbedUrl(fixture, session, "https://vihar.online", `${fixture.embedUrl}#vihar_launch=${ticket}`));
  assert.equal(url.origin, quickPlayOrigin);
  assert.equal(url.pathname, "/chess/play");
  assert.equal(url.searchParams.get("vihar_session"), session);
  assert.equal(url.searchParams.get("vihar_embed"), "1");
  assert.equal(url.hash, `#vihar_launch=${ticket}`);
  assert(!url.search.includes(ticket));
  for (const bad of [quickPlayOrigin, "https://evil.example/chess/play", `${quickPlayOrigin}/ludo/play`, `${fixture.embedUrl}?url=https://evil.example`, `${fixture.embedUrl}#token=durable-token`, `${fixture.embedUrl}#vihar_launch=short`, `https://player:password@games.vihar.online/chess/play`]) assert.throws(() => buildEmbedUrl(fixture, session, "https://vihar.online", bad));
  assert.throws(() => buildEmbedUrl(fixture, "short", "https://vihar.online"));
  assert.throws(() => buildEmbedUrl(fixture, session, "http://evil.example"));
  assert.throws(() => buildEmbedUrl(fixture, session, "https://vihar.online/path"));
  assert.equal(embedMessage(fixture.id, session, { type: "stop" }).version, 1);
});

test("unverified releases cannot launch, and login returns only to known game pages", () => {
  assert.equal(quickPlayGames.length, 24);
  assert.equal(new Set(quickPlayGames.map((game) => game.id)).size, 24);
  assert.deepEqual(quickPlayGames.slice(0, 4).map((game) => game.id).sort(), ["carrom", "chess", "paperwing", "tic-tac-toe"]);
  assert(quickPlayGames.slice(4).every((game) => game.release.status === "upcoming"));
  assert(!quickPlayGames.some((game) => ["bap-ka-rasta", "gulam-chor"].includes(game.id)));
  for (const game of quickPlayGames) {
    assert.equal(new URL(game.embedUrl).origin, game.allowedOrigin);
    assert.equal(safeReturnPath(`/games/${game.id}`), `/games/${game.id}`);
    assert.equal(safeReturnPath(`/games/${game.id}?next=//evil.example`), "/dashboard");
    if (game.release.status === "upcoming") assert.throws(() => buildEmbedUrl(game, session, "https://vihar.online"), /coming soon/);
  }
  for (const release of [{ ...fixture.release, modes: [] }, { ...fixture.release, devices: [] }, { ...fixture.release, verifiedAt: "not-verified" }, { ...fixture.release, controls: "" }]) assert.throws(() => assertQuickPlayRelease({ ...fixture, release }));
});
