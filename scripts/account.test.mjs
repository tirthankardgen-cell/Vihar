import assert from "node:assert/strict";
import test from "node:test";
import { accountError, avatars, normalizeUsername, playTime, safeReturnPath, usernameError } from "../src/lib/account/model.ts";
import { buildLaunchActivity, buildPlayActivity } from "../src/lib/account/activity.ts";

test("usernames have one canonical, reserved-aware identity", () => {
  assert.equal(normalizeUsername(" @Sunny_Road "), "sunny_road");
  for (const name of ["sun", "road_runner", "wanderer27"]) assert.equal(usernameError(name), null);
  for (const name of ["", "aa", "UPPER", "1player", "hello.world", "hello/world", "éclair", "a".repeat(21), "admin", "vihar", "support", "system"]) assert.equal(typeof usernameError(name), "string", name);
});
test("login return paths cannot navigate to external or arbitrary pages", () => {
  for (const path of ["/dashboard", "/dashboard/friends", "/dashboard/settings", "/dashboard/games", "/dashboard/publish", "/community/AbC123_game", "/u/sunny_road", "/games/gulam-chor", "/games/bap-ka-rasta"]) assert.equal(safeReturnPath(path), path);
  for (const path of [null, "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/%2f%2fevil.example", "/auth/action?oobCode=stolen", "/dashboard?redirect=https://evil.example", "/u/admin", "/u/x", " /dashboard", "/community/../dashboard", "/community/id?redirect=https://evil.example"]) assert.equal(safeReturnPath(path), "/dashboard");
});

test("activity counts persisted game opens on their UTC date, excluding pending and out-of-range events", () => {
  const launch = (date) => ({ startedAt: date ? { toMillis: () => Date.parse(date) } : null });
  const result = buildLaunchActivity([
    launch("2026-11-07T23:59:59Z"), launch("2026-11-08T00:00:00Z"),
    launch("2026-11-08T12:00:00Z"), launch(null), launch("invalid"),
    launch("2026-11-09T00:00:00Z"), launch("2025-01-01T00:00:00Z"),
  ], "2026-11-08", 90);
  assert.deepEqual(result.days.slice(-2), [{ date: "2026-11-07", count: 1 }, { date: "2026-11-08", count: 2 }]);
  assert.equal(result.days.reduce((sum, day) => sum + day.count, 0), 3);
  assert.equal(buildLaunchActivity([], "2026-11-08", 365).hasDailyData, false);
  assert.equal(safeReturnPath("/games/fake-game"), "/dashboard");
  assert.equal(safeReturnPath("/games/gulam-chor?redirect=//evil.example"), "/dashboard");
});
test("auth errors do not reveal whether a sign-in email exists", () => {
  assert.equal(accountError({ code: "auth/user-not-found" }), accountError({ code: "auth/wrong-password" }));
  assert.equal(accountError({ code: "auth/invalid-credential" }), accountError({ code: "auth/wrong-password" }));
  assert(!accountError(new Error("secret token")).includes("secret"));
});
test("personal stats use elapsed time and the avatar catalogue is fixed", () => {
  assert.equal(playTime(0), "0m"); assert.equal(playTime(59), "0m"); assert.equal(playTime(3660), "1h 1m");
  assert.equal(new Set(avatars.map((item) => item.id)).size, 6);
});

test("activity sums daily game records across leap days without inventing a history from totals", () => {
  const stats = [
    { sessions: 99, lastPlayedAt: { toMillis: () => Date.parse("2024-03-01") } },
    { dailySessions: { "2024-02-28": 1, "2024-02-29": 2, "2024-03-01": 3 } },
    { dailySessions: { "2024-02-29": 4 } },
  ];
  const result = buildPlayActivity(stats, "2024-03-01", 90);
  assert.equal(result.days.length, 90);
  assert.deepEqual(result.days.slice(-3), [{ date: "2024-02-28", count: 1 }, { date: "2024-02-29", count: 6 }, { date: "2024-03-01", count: 3 }]);
  assert.equal(result.days.reduce((sum, day) => sum + day.count, 0), 10);
  assert.equal(result.hasDailyData, true);
  const legacy = buildPlayActivity([stats[0]], "2024-03-01", 365);
  assert.equal(legacy.hasDailyData, false);
  assert(legacy.days.every((day) => day.count === 0));
});

test("activity ignores future, out-of-range and malformed records", () => {
  const result = buildPlayActivity([{ dailySessions: {
    "2025-01-01": 1, "2025-01-02": 10, "2023-12-31": 20,
    "2024-02-30": 30, "2024-06-01": -1, "2024-06-02": NaN,
    "2024-06-03": Infinity, "2024-06-04": 1.5, "2024-06-05": "2",
    "2024-06-06": 0, "not-a-date": 3,
  } }], "2025-01-01", 365);
  assert.equal(result.days[0].date, "2024-01-03");
  assert.equal(result.days.at(-1).date, "2025-01-01");
  assert.equal(result.days.reduce((sum, day) => sum + day.count, 0), 1);
  assert.throws(() => buildPlayActivity([], "2025-02-30", 90), RangeError);
});
