import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = (await readFile(new URL("../public/sdk/vihar-embed.js", import.meta.url), "utf8")).replace("export function", "function");
function frame({ embedded = true } = {}) {
  const events = new Map(), messages = [], visibility = [], stops = [];
  const parent = { postMessage: (data, origin) => messages.push({ data, origin }) };
  const window = { parent, addEventListener: (type, fn) => events.set(type, fn), removeEventListener: (type) => events.delete(type) };
  if (!embedded) window.parent = window;
  const context = { window, URL, URLSearchParams, location: { search: "?vihar_embed=1&vihar_session=frame-session-123456" } };
  vm.runInNewContext(`${source}\nglobalThis.create = createViharEmbed;`, context);
  const bridge = context.create({ gameId: "chess", onVisibilityChange: (value) => visibility.push(value), onExit: () => { stops.push(true); } });
  const envelope = { channel: "vihar:embed", version: 1, gameId: "chess", sessionId: "frame-session-123456" };
  const send = (data, extra = {}) => events.get("message")?.({ source: parent, origin: "https://vihar.online", data: { ...envelope, ...data }, ...extra });
  return { bridge, events, messages, visibility, stops, parent, send };
}

test("readiness requires both an initialized parent and an explicit game-ready signal", () => {
  const b = frame();
  b.bridge.ready();
  assert.equal(b.messages.length, 0);
  b.send({ type: "init", visible: true }, { origin: "https://evil.example" });
  b.send({ type: "init", visible: true }, { source: {} });
  for (const data of [{ version: 2 }, { gameId: "ludo" }, { sessionId: "old-session" }, { visible: "yes" }, { url: "https://evil.example" }]) b.send({ type: "init", visible: true, ...data });
  assert.equal(b.messages.length, 0);
  b.send({ type: "init", visible: true });
  assert.equal(b.messages[0].data.type, "ready");
  assert.equal(b.messages[0].origin, "https://vihar.online");
  assert.deepEqual(b.visibility, [true]);
});

test("visibility and exit flush game-owned tracking once and acknowledge parent stop", async () => {
  const b = frame();
  b.send({ type: "init", visible: true });
  b.bridge.ready();
  b.send({ type: "visibility", visible: false });
  b.send({ type: "visibility", visible: true });
  await b.bridge.exit();
  assert.equal(b.messages.at(-1).data.type, "exit");
  b.send({ type: "stop" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(b.messages.at(-1).data.type, "stopped");
  assert.equal(b.stops.length, 1);
  assert.deepEqual(b.visibility, [true, false, true, false]);
  b.send({ type: "visibility", visible: true });
  assert.equal(b.visibility.at(-1), false);
  b.bridge.dispose();
  assert.equal(b.events.size, 0);
});

test("Escape requests exit; standalone games do not acquire parent controls", async () => {
  const b = frame(); b.send({ type: "init", visible: true }); b.bridge.ready();
  let prevented = false;
  b.events.get("keydown")({ key: "Escape", preventDefault: () => { prevented = true; } });
  await new Promise((resolve) => setImmediate(resolve));
  assert(prevented);
  assert.equal(b.messages.at(-1).data.type, "exit");
  assert.equal(b.stops.length, 1);
  const standalone = frame({ embedded: false });
  assert.equal(standalone.bridge.embedded, false);
  standalone.bridge.ready(); await standalone.bridge.exit();
  assert.equal(standalone.messages.length, 0);
  assert.equal(standalone.events.size, 0);
});

test("failure sends a bounded code instead of arbitrary game content", () => {
  const b = frame(); b.bridge.fail("secret-or-markup"); b.send({ type: "init", visible: true });
  assert.equal(b.messages[0].data.type, "error");
  assert.equal(b.messages[0].data.code, "load_failed");
});
