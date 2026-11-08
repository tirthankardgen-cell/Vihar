import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import test from "node:test";
const source = (await readFile(new URL("../public/sdk/vihar-id.js", import.meta.url), "utf8")).replace("export function createViharId", "function createViharId");
const tick = () => new Promise((resolve) => setImmediate(resolve));
function browser() {
  let clock = 1000, nextTimer = 0;
  const requests = [], storage = new Map(), intervals = new Map(), windowEvents = new Map(), documentEvents = new Map();
  const location = { origin: "https://studio.example.com", pathname: "/play", search: "?level=2", hash: "" };
  const popup = { closed: false, location: { replace: (url) => { popup.url = url; } }, close: () => { popup.closed = true; } };
  const window = { open: () => popup, addEventListener: (name, fn) => windowEvents.set(name, fn), removeEventListener: (name) => windowEvents.delete(name) };
  const document = { visibilityState: "visible", addEventListener: (name, fn) => documentEvents.set(name, fn), removeEventListener: (name) => documentEvents.delete(name) };
  const history = { state: null, replaceState: (_, __, url) => { history.url = url; location.hash = new URL(url, location.origin).hash; } };
  let responder = (action) => action === "token" ? { accessToken: "scoped-token", mode: "activity", expiresIn: 43200 } : action === "me" ? { sub: "player", username: "player", displayName: "Player" } : {};
  const context = { crypto: webcrypto, TextEncoder, btoa, URL, URLSearchParams, console, location, history, window, document, performance: { now: () => clock }, sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) }, setInterval: (fn) => { intervals.set(++nextTimer, fn); return nextTimer; }, clearInterval: (id) => intervals.delete(id), setTimeout, clearTimeout,
    fetch: async (url, options) => { const action = url.split("/").at(-1); const data = JSON.parse(options.body); requests.push({ action, data, options }); const result = await responder(action, data); return { ok: !result.error, status: result.status || 200, json: async () => result }; } };
  vm.runInNewContext(`${source}\nglobalThis.create = createViharId;`, context);
  const errors = [], sdk = context.create({ gameId: "test-game", onError: (error) => errors.push(error) });
  return { sdk, requests, errors, location, history, popup, windowEvents, documentEvents, document, intervals, clock: (value) => { clock = value; }, respond: (fn) => { responder = fn; } };
}
test("guest gameplay does not invent a session or require login", async () => {
  const b = browser();
  assert.equal(await b.sdk.resumeLaunch(), false);
  assert.equal((await b.sdk.startSession()).guest, true);
  assert.equal(b.requests.length, 0);
});

test("a fresh embedded guest never inherits a previous player's credential", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch();
  b.location.search = "?vihar_embed=1&vihar_session=new-frame-session";
  assert.equal(await b.sdk.resumeLaunch(), false);
  const requests = b.requests.length;
  assert.equal((await b.sdk.startSession()).guest, true);
  assert.equal(b.requests.length, requests);
});

test("a failed embedded ticket clears stale credentials before the exchange", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch();
  b.location.search = "?vihar_embed=1";
  b.location.hash = `#vihar_launch=${"b".repeat(43)}`;
  b.respond(() => ({ error: "invalid_code", status: 401 }));
  await assert.rejects(b.sdk.resumeLaunch(), { code: "invalid_code" });
  assert.equal((await b.sdk.startSession()).guest, true);
  assert.equal(b.location.hash, "");
});

test("repeated embedded initialization shares one exchange and retains its new credential", async () => {
  const b = browser(); b.location.search = "?vihar_embed=1"; b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  const [first, second] = await Promise.all([b.sdk.resumeLaunch(), b.sdk.resumeLaunch()]);
  assert.equal(first, true); assert.equal(second, true);
  assert.equal(b.requests.filter((request) => request.action === "token").length, 1);
  assert.equal(await b.sdk.resumeLaunch(), true);
  await b.sdk.signOut();
  assert.equal(await b.sdk.resumeLaunch(), false);
});

test("explicit exit flushes the final gameplay interval with keepalive", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch(); await b.sdk.startSession();
  b.clock(6000); await b.sdk.stopSession();
  assert.equal(b.requests.at(-1).data.operation, "end");
  assert.equal(b.requests.at(-1).options.keepalive, true);
  assert.equal(b.intervals.size, 0);
});
test("launch ticket is removed before exchange and preserves the existing hash router", async () => {
  const b = browser();
  b.location.hash = `#/route/2&vihar_launch=${"a".repeat(43)}`;
  assert.equal(await b.sdk.resumeLaunch(), true);
  assert.equal(b.history.url, "/play?level=2#/route/2");
  assert.equal(b.requests[0].data.code, "a".repeat(43));
  assert.equal(b.sdk.getAccessToken(), null);
});
test("pause and hidden-tab intervals do not accumulate gameplay time", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch(); await b.sdk.startSession();
  b.clock(16000); b.document.visibilityState = "hidden"; b.documentEvents.get("visibilitychange")(); await tick();
  b.clock(46000); [...b.intervals.values()][0](); await tick();
  b.clock(61000); b.document.visibilityState = "visible"; b.documentEvents.get("visibilitychange")(); await tick();
  b.clock(71000); b.sdk.setPlaying(false); await tick();
  b.clock(101000); b.sdk.setPlaying(true); await tick();
  b.clock(106000); await b.sdk.stopSession();
  const reports = b.requests.filter((request) => request.action === "session" && request.data.operation !== "start");
  assert.deepEqual(reports.map((request) => request.data.elapsedMs), [15000, 0, 0, 10000, 0, 5000]);
  assert.deepEqual(reports.map((request) => request.data.sequence), [1, 2, 3, 4, 5, 6]);
  assert.equal(b.intervals.size, 0); assert.equal(b.documentEvents.size, 0);
});
test("sign-in accepts only the expected popup, origin and state and exchanges PKCE", async () => {
  const b = browser();
  b.respond((action) => action === "token" ? { accessToken: "identity-token", mode: "identity", expiresIn: 43200 } : { sub: "player", username: "player" });
  const promise = b.sdk.signIn();
  for (let i = 0; i < 100 && !b.popup.url; i++) await tick();
  assert(b.popup.url);
  const url = new URL(b.popup.url), state = url.searchParams.get("state");
  const receive = b.windowEvents.get("message");
  const data = { type: "vihar:id:authorization", state, code: "a".repeat(43) };
  receive({ origin: "https://evil.example.com", source: b.popup, data });
  receive({ origin: "https://vihar.online", source: {}, data });
  receive({ origin: "https://vihar.online", source: b.popup, data: { ...data, state: "wrong" } });
  assert.equal(b.requests.length, 0);
  receive({ origin: "https://vihar.online", source: b.popup, data });
  assert.equal((await promise).sub, "player");
  assert.equal(b.requests[0].data.verifier.length, 64);
  assert.equal(b.sdk.getAccessToken(), "identity-token");
  await b.sdk.signOut(); assert.equal(b.sdk.getAccessToken(), null);
  assert.equal(b.requests.at(-1).action, "revoke");
});

test("concurrent gameplay starts share one session request", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch();
  let release;
  b.respond(() => new Promise((resolve) => { release = resolve; }));
  const first = b.sdk.startSession(), second = b.sdk.startSession();
  assert.equal(b.requests.filter((request) => request.data.operation === "start").length, 1);
  release({ sessionId: "same-session" });
  assert.equal((await first).sessionId, (await second).sessionId);
  b.respond(() => ({}));
  await b.sdk.stopSession();
});

test("failed remote sign-out still clears local credentials and tracking", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch(); await b.sdk.startSession();
  b.respond((action) => action === "revoke" ? { error: "service_unavailable", status: 503 } : {});
  await assert.rejects(b.sdk.signOut(), { code: "service_unavailable" });
  assert.equal(await b.sdk.resumeLaunch(), false);
  assert.equal((await b.sdk.startSession()).guest, true);
  assert.equal(b.intervals.size, 0);
  assert.equal(b.windowEvents.size, 0);
});

test("returning from the browser back-forward cache starts a fresh session", async () => {
  const b = browser(); b.location.hash = `#vihar_launch=${"a".repeat(43)}`;
  await b.sdk.resumeLaunch(); await b.sdk.startSession();
  b.clock(16000); b.windowEvents.get("pagehide")(); await tick();
  assert.equal(b.intervals.size, 0);
  await b.windowEvents.get("pageshow")({ persisted: true });
  const starts = b.requests.filter((request) => request.data.operation === "start");
  assert.equal(starts.length, 2);
  assert.notEqual(starts[0].data.sessionId, starts[1].data.sessionId);
  assert.equal(b.intervals.size, 1);
  await b.sdk.stopSession();
});
