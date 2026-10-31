import assert from "node:assert/strict";
import test from "node:test";
import { getAdSenseConfig } from "../src/lib/adsense-config.ts";
import { isAdContentPath } from "../src/lib/ad-content.ts";

const ready = { ADSENSE_ENABLED: "true", ADSENSE_SITE_APPROVED: "true", ADSENSE_CONSENT_READY: "true" };

test("review mode retains the publisher without loading ads", () => {
  assert.deepEqual(getAdSenseConfig({}), { publisherId: "ca-pub-6693217545827146", enabled: false });
  assert.equal(getAdSenseConfig({ ADSENSE_ENABLED: "true" }).enabled, false, "legacy production setting must fail closed");
});

test("approval, consent readiness and serving are independently required", () => {
  for (const key of Object.keys(ready)) {
    for (const value of [undefined, "false", "TRUE", "1", ""]) {
      assert.equal(getAdSenseConfig({ ...ready, [key]: value }).enabled, false, `${key}=${value}`);
    }
  }
  assert.equal(getAdSenseConfig(ready).enabled, true);
  assert.equal(getAdSenseConfig({ ...ready, VERCEL_ENV: "preview" }).enabled, false);
});

test("publisher declaration can be removed but cannot be malformed or absent when requested", () => {
  assert.equal(getAdSenseConfig({ ADSENSE_PUBLISHER_ID: "", ADSENSE_ENABLED: "false" }).publisherId, "");
  assert.throws(() => getAdSenseConfig({ ...ready, ADSENSE_PUBLISHER_ID: "" }), /requires ADSENSE_PUBLISHER_ID/);
  for (const value of ["pub-6693217545827146", "ca-pub-123", "<script>"]) {
    assert.throws(() => getAdSenseConfig({ ADSENSE_PUBLISHER_ID: value }), /must be ca-pub-/);
  }
});

test("only the finished guide can contain the advertising loader", () => {
  assert.equal(isAdContentPath("/guides/bap-ka-rasta-first-drive"), true);
  assert.equal(isAdContentPath("/guides/bap-ka-rasta-first-drive/"), true);
  for (const path of ["/", "/games", "/games/bap-ka-rasta", "/games/gulam-chor", "/about", "/help", "/contact", "/privacy", "/terms", "/missing", "/guides/bap-ka-rasta-first-drive/missing"]) {
    assert.equal(isAdContentPath(path), false, path);
  }
});
