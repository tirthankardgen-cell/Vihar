import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, setLogLevel, updateDoc, where, writeBatch } from "firebase/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("Run npm run test:rules; these tests must never use a live Firebase project.");
setLogLevel("silent");
let environment;
before(async () => {
  environment = await initializeTestEnvironment({ projectId: "demo-vihar", firestore: { rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8") } });
});
beforeEach(async () => environment.clearFirestore());
after(async () => environment?.cleanup());
const db = (uid, verified = true) => environment.authenticatedContext(uid, { email: `${uid}@example.test`, email_verified: verified }).firestore();
const anonymous = () => environment.unauthenticatedContext().firestore();
const profile = (uid, username = uid, extra = {}) => ({ uid, username, displayName: "A player", bio: "Here to wander.", avatarId: "sun", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra });
async function claim(uid, username = uid, extra = {}, database = db(uid)) {
  const batch = writeBatch(database);
  batch.set(doc(database, "profiles", uid), profile(uid, username, extra));
  batch.set(doc(database, "usernames", username), { uid });
  return batch.commit();
}
const requestData = (from, to, extra = {}) => ({ from, to, members: [from, to], status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra });
const requestRef = (database, from = "alice", to = "bobby") => doc(database, "friendships", `${from}__${to}`);
async function players() { await claim("alice"); await claim("bobby"); }
async function pending() { await players(); await setDoc(requestRef(db("alice")), requestData("alice", "bobby")); }

test("an account claims a public profile and unique username atomically", async () => {
  await assertSucceeds(claim("alice"));
  const snapshot = await assertSucceeds(getDoc(doc(anonymous(), "profiles", "alice")));
  assert.equal(snapshot.data().username, "alice");
  assert.equal(snapshot.data().email, undefined);
  assert.equal((await getDoc(doc(anonymous(), "usernames", "alice"))).data().uid, "alice");
});
test("simultaneous claims cannot take the same username or leave an orphan profile", async () => {
  const outcomes = await Promise.allSettled([claim("alice", "wanderer"), claim("bobby", "wanderer")]);
  assert.equal(outcomes.filter((item) => item.status === "fulfilled").length, 1);
  const claimedBy = (await getDoc(doc(anonymous(), "usernames", "wanderer"))).data().uid;
  assert.equal((await getDoc(doc(anonymous(), "profiles", claimedBy))).data().username, "wanderer");
  assert.equal((await getDoc(doc(anonymous(), "profiles", claimedBy === "alice" ? "bobby" : "alice"))).exists(), false);
});
test("standalone username reservations, orphan profiles and unauthenticated writes are denied", async () => {
  await assertFails(setDoc(doc(db("alice"), "usernames", "alice"), { uid: "alice" }));
  await assertFails(setDoc(doc(db("alice"), "profiles", "alice"), profile("alice")));
  await assertFails(claim("alice", "alice", {}, anonymous()));
  await assertFails(claim("bobby", "bobby", {}, db("alice")));
});
test("profile schema rejects private fields, privilege injection and invalid identity values", async () => {
  for (const extra of [{ email: "private@example.test" }, { role: "admin" }, { avatarId: "https://evil.example/avatar" }, { displayName: "" }, { displayName: "x".repeat(33) }, { bio: "x".repeat(161) }, { uid: "bobby" }, { createdAt: new Date(0) }]) await assertFails(claim("alice", "alice", extra));
  for (const name of ["admin", "vihar", "support", "official", "Abc", "ab", "abc.def", "a".repeat(21)]) await assertFails(claim("alice", name));
});
test("only an owner can edit allowed profile fields and the username stays fixed", async () => {
  await claim("alice");
  const ref = doc(db("alice"), "profiles", "alice");
  await assertSucceeds(updateDoc(ref, { displayName: "New name", bio: "New bio", avatarId: "planet", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(db("bobby"), "profiles", "alice"), { bio: "Hacked", updatedAt: serverTimestamp() }));
  for (const extra of [{ username: "other_name" }, { uid: "bobby" }, { email: "leak@example.test" }, { createdAt: new Date(0) }]) await assertFails(updateDoc(ref, { ...extra, updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(ref));
  await assertFails(updateDoc(doc(db("alice"), "usernames", "alice"), { uid: "bobby" }));
  await assertFails(deleteDoc(doc(db("alice"), "usernames", "alice")));
  await assertFails(setDoc(doc(db("alice"), "usernames", "second_name"), { uid: "alice" }));
});
test("public links work without permitting profile or username enumeration", async () => {
  await claim("alice");
  await assertSucceeds(getDoc(doc(anonymous(), "profiles", "alice")));
  await assertSucceeds(getDoc(doc(anonymous(), "usernames", "not_claimed")));
  for (const database of [anonymous(), db("alice")]) {
    await assertFails(getDocs(collection(database, "profiles")));
    await assertFails(getDocs(collection(database, "usernames")));
  }
});
test("favourites are private, owner controlled and limited to known games", async () => {
  const mine = doc(db("alice"), "players", "alice", "favorites", "bap-ka-rasta");
  await assertSucceeds(setDoc(mine, { addedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(db("alice"), "players", "alice", "favorites")));
  for (const database of [anonymous(), db("bobby")]) {
    await assertFails(getDoc(doc(database, "players", "alice", "favorites", "bap-ka-rasta")));
    await assertFails(deleteDoc(doc(database, "players", "alice", "favorites", "bap-ka-rasta")));
  }
  await assertFails(setDoc(doc(db("alice"), "players", "alice", "favorites", "made-up-game"), { addedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("alice"), "players", "alice", "favorites", "gulam-chor"), { addedAt: new Date(0), score: 999 }));
  await assertSucceeds(deleteDoc(mine));
});
test("no browser account can award, edit or delete game statistics", async () => {
  const route = ["profiles", "alice", "stats", "bap-ka-rasta"];
  const stats = { sessions: 2, playSeconds: 360, lastPlayedAt: serverTimestamp() };
  await assertFails(setDoc(doc(db("alice"), ...route), stats));
  await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), ...route), stats));
  await assertSucceeds(getDoc(doc(anonymous(), ...route)));
  await assertFails(updateDoc(doc(db("alice"), ...route), { sessions: 999 }));
  await assertFails(deleteDoc(doc(db("alice"), ...route)));
});
test("verified players can request friendship but cannot forge, self-accept or self-friend", async () => {
  await players();
  await assertFails(setDoc(requestRef(db("alice", false)), requestData("alice", "bobby")));
  await assertFails(setDoc(requestRef(db("intruder")), requestData("alice", "bobby")));
  await assertFails(setDoc(requestRef(db("alice"), "alice", "alice"), requestData("alice", "alice")));
  await assertFails(setDoc(requestRef(db("alice"), "alice", "nobody"), requestData("alice", "nobody")));
  for (const extra of [{ status: "accepted" }, { members: ["alice", "bobby", "intruder"] }, { createdAt: new Date(0) }, { secret: "injected" }]) await assertFails(setDoc(requestRef(db("alice")), requestData("alice", "bobby", extra)));
  await assertSucceeds(setDoc(requestRef(db("alice")), requestData("alice", "bobby")));
  await assertFails(updateDoc(requestRef(db("alice")), { status: "accepted", updatedAt: serverTimestamp() }));
});
test("only the intended verified recipient can accept; membership and timestamps cannot be rewritten", async () => {
  await pending();
  for (const client of [db("intruder"), db("bobby", false)]) await assertFails(updateDoc(requestRef(client), { status: "accepted", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(requestRef(db("bobby")), { status: "accepted", members: ["alice", "intruder"], updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(requestRef(db("bobby")), { status: "accepted", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(requestRef(db("bobby")), { status: "pending", updatedAt: serverTimestamp() }));
});
test("friend connections and requests are readable only by their two participants", async () => {
  await pending();
  for (const uid of ["alice", "bobby"]) {
    await assertSucceeds(getDoc(requestRef(db(uid))));
    assert.equal((await assertSucceeds(getDocs(query(collection(db(uid), "friendships"), where("members", "array-contains", uid))))).size, 1);
  }
  await assertFails(getDoc(requestRef(anonymous())));
  await assertFails(getDoc(requestRef(db("intruder"))));
  await assertFails(getDocs(collection(db("alice"), "friendships")));
  await assertFails(getDocs(query(collection(db("intruder"), "friendships"), where("members", "array-contains", "alice"))));
});
test("reciprocal requests cannot duplicate an existing connection, including simultaneous writes", async () => {
  await players();
  const outcomes = await Promise.allSettled([
    setDoc(requestRef(db("alice")), requestData("alice", "bobby")),
    setDoc(requestRef(db("bobby"), "bobby", "alice"), requestData("bobby", "alice")),
  ]);
  assert.equal(outcomes.filter((item) => item.status === "fulfilled").length, 1);
});
test("either participant can cancel, decline or remove a connection; outsiders cannot", async () => {
  await pending();
  await assertFails(deleteDoc(requestRef(db("intruder"))));
  await assertSucceeds(deleteDoc(requestRef(db("alice"))));
  await setDoc(requestRef(db("alice")), requestData("alice", "bobby"));
  await assertSucceeds(deleteDoc(requestRef(db("bobby"))));
  await setDoc(requestRef(db("alice")), requestData("alice", "bobby"));
  await updateDoc(requestRef(db("bobby")), { status: "accepted", updatedAt: serverTimestamp() });
  await assertSucceeds(deleteDoc(requestRef(db("alice"))));
});
test("all unrecognized collections are denied by default", async () => {
  await assertFails(setDoc(doc(db("alice"), "admins", "alice"), { admin: true }));
  await assertFails(getDoc(doc(db("alice"), "accounts", "bobby")));
  await assertFails(setDoc(doc(db("alice"), "profiles", "alice", "achievements", "winner"), { unlocked: true }));
});
