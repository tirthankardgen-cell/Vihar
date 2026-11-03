import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { publicGames } from "../src/lib/community-public.ts";

const originalFetch = globalThis.fetch;
const originalProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalProject === undefined) delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  else process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = originalProject;
});

test("community index permission and backend failures do not abort sitemap generation", async () => {
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-vihar";
  for (const status of [403, 429, 500, 503]) {
    globalThis.fetch = async () => new Response("unavailable", { status });
    assert.deepEqual(await publicGames(), []);
  }
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  assert.deepEqual(await publicGames(), []);
});

test("a successful request still indexes published games and their actual update times", async () => {
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-vihar";
  globalThis.fetch = async (url, options) => {
    assert.match(url, /projects\/demo-vihar\/databases\/\(default\)\/documents:runQuery$/);
    assert.equal(JSON.parse(options.body).structuredQuery.where.fieldFilter.value.booleanValue, true);
    assert.equal(options.next.revalidate, 300);
    assert(options.signal instanceof AbortSignal);
    return Response.json([{ document: { name: "projects/demo-vihar/databases/(default)/documents/communityGames/orbit", fields: {
      ownerId: { stringValue: "alice" }, title: { stringValue: "Orbit" }, description: { stringValue: "Space game" }, url: { stringValue: "https://example.com/" }, kind: { stringValue: "browser" }, published: { booleanValue: true }, updatedAt: { timestampValue: "2026-11-03T10:00:00Z" },
    } } }]);
  };
  const games = await publicGames();
  assert.equal(games.length, 1);
  assert.equal(games[0].id, "orbit");
  assert.equal(games[0].updatedAt, "2026-11-03T10:00:00Z");
});

test("an unconfigured project needs no remote request", async () => {
  delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  globalThis.fetch = async () => { assert.fail("No request expected"); };
  assert.deepEqual(await publicGames(), []);
});
