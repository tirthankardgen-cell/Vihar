import assert from "node:assert/strict";
import test from "node:test";
import { creditedMilliseconds, digest, gameOrigin, progressData } from "../src/lib/vihar-id/protocol.ts";
import { safeReturnPath } from "../src/lib/account/model.ts";
import { helpArticles } from "../src/lib/help.ts";

test("only exact HTTPS game origins are accepted in production", () => {
  assert.equal(gameOrigin("https://game.example.com/"), "https://game.example.com");
  for (const value of ["http://game.example.com", "https://game.example.com/path", "https://evil.example.com?next=other", "https://user:pass@game.example.com", "https://game.example.com:444", "null"]) assert.throws(() => gameOrigin(value));
});
test("recent elapsed reports are bounded and offline gaps add no time", () => {
  assert.equal(creditedMilliseconds(45000, 1000, 5000), 4000);
  assert.equal(creditedMilliseconds(15000, 1000, 16000), 15000);
  assert.equal(creditedMilliseconds(45000, 0, 90001), 0);
  assert.equal(creditedMilliseconds(10, 20, 10), 0);
  for (const value of [-1, 45001, 1.5, "15000", Infinity]) assert.throws(() => creditedMilliseconds(value, 0, 30000));
});
test("PKCE hashes follow the S256 RFC example", () => {
  assert.equal(digest("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
});
test("cloud saves require bounded JSON objects", () => {
  assert.equal(progressData({ level: 3 }), '{"level":3}');
  for (const value of [null, [], "string", { value: "x".repeat(60000) }]) assert.throws(() => progressData(value));
});
test("auth connection returns are local and cannot carry attacker redirect parameters", () => {
  assert.equal(safeReturnPath("/auth/connect"), "/auth/connect");
  for (const value of ["/auth/connect?next=//evil.example", "/auth/connect/evil", "https://evil.example/auth/connect"]) assert.equal(safeReturnPath(value), "/dashboard");
});
test("help article identifiers, sections and related links resolve uniquely", () => {
  const slugs = new Set(helpArticles.map((article) => article.slug));
  assert.equal(slugs.size, helpArticles.length);
  assert.equal(new Set(helpArticles.map((article) => article.title)).size, helpArticles.length);
  for (const article of helpArticles) {
    assert(article.description.length >= 80);
    assert.equal(new Set(article.sections.map((section) => section.id)).size, article.sections.length);
    for (const related of article.related) assert(slugs.has(related), `${article.slug}: missing ${related}`);
  }
});
