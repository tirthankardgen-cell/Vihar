import assert from "node:assert/strict";
import test from "node:test";
import { accountError, avatars, normalizeUsername, playTime, safeReturnPath, usernameError } from "../src/lib/account/model.ts";

test("usernames have one canonical, reserved-aware identity", () => {
  assert.equal(normalizeUsername(" @Sunny_Road "), "sunny_road");
  for (const name of ["sun", "road_runner", "wanderer27"]) assert.equal(usernameError(name), null);
  for (const name of ["", "aa", "UPPER", "1player", "hello.world", "hello/world", "éclair", "a".repeat(21), "admin", "vihar", "support", "system"]) assert.equal(typeof usernameError(name), "string", name);
});
test("login return paths cannot navigate to external or arbitrary pages", () => {
  for (const path of ["/dashboard", "/dashboard/friends", "/dashboard/settings", "/dashboard/games", "/u/sunny_road"]) assert.equal(safeReturnPath(path), path);
  for (const path of [null, "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/%2f%2fevil.example", "/auth/action?oobCode=stolen", "/dashboard?redirect=https://evil.example", "/u/admin", "/u/x", " /dashboard"]) assert.equal(safeReturnPath(path), "/dashboard");
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
