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
const activityRef = (database, uid = "bobby", id = "open-one") => doc(database, "players", uid, "activity", id);
const activityData = (extra = {}) => ({ source: "officialGames", gameId: "gulam-chor", title: "Gulam Chor", startedAt: serverTimestamp(), ...extra });

test("Quick Play favourites are private and only the release-gated server can issue review receipts", async () => {
  const database = db("bobby"), receipt = (connection) => doc(connection, "officialGames", "chess", "players", "bobby");
  const review = (connection) => doc(connection, "officialGames", "chess", "reviews", "bobby");
  const data = () => ({ rating: 4, text: "A thoughtful round", updatedAt: serverTimestamp() });
  await assertSucceeds(setDoc(doc(database, "players", "bobby", "favorites", "chess"), { addedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(db("alice"), "players", "bobby", "favorites", "chess")));
  await assertFails(setDoc(doc(database, "players", "bobby", "favorites", "made-up-game"), { addedAt: serverTimestamp() }));
  await assertFails(setDoc(receipt(database), { startedAt: serverTimestamp() }));
  await assertFails(setDoc(review(database), data()));
  await assertFails(setDoc(activityRef(database), activityData({ gameId: "chess", title: "Chess" })));
  await environment.withSecurityRulesDisabled(async (context) => { await setDoc(receipt(context.firestore()), { startedAt: new Date() }); });
  await assertSucceeds(setDoc(review(database), data()));
  await assertSucceeds(getDoc(review(anonymous())));
  await assertSucceeds(getDoc(receipt(database)));
  await assertFails(getDoc(receipt(anonymous())));
  await assertFails(setDoc(review(db("alice")), data()));
  await assertFails(deleteDoc(review(db("alice"))));
  await assertFails(setDoc(doc(database, "officialGames", "chess", "metrics", "activity"), { playMilliseconds: 99999 }));
  await assertSucceeds(deleteDoc(review(database)));
});

test("game opens and review eligibility save atomically, with private immutable server timestamps", async () => {
  const database = db("bobby", false);
  await assertFails(setDoc(activityRef(database), activityData()));
  const batch = writeBatch(database);
  batch.set(doc(database, "officialGames", "gulam-chor", "players", "bobby"), { startedAt: serverTimestamp() });
  batch.set(activityRef(database), activityData());
  await assertSucceeds(batch.commit());
  await assertSucceeds(setDoc(doc(database, "officialGames", "gulam-chor", "reviews", "bobby"), { rating: 4, text: "A lovely round", updatedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(database, "players", "bobby", "activity")));
  await assertFails(getDoc(activityRef(anonymous())));
  await assertFails(getDoc(activityRef(db("alice"))));
  await assertFails(getDocs(collection(db("alice"), "players", "bobby", "activity")));
  await assertFails(setDoc(activityRef(db("alice")), activityData()));
  await assertFails(updateDoc(activityRef(database), { startedAt: serverTimestamp() }));
  await assertFails(deleteDoc(activityRef(database)));
  await assertSucceeds(setDoc(activityRef(database, "bobby", "open-two"), activityData()));
  for (const extra of [{ startedAt: new Date(0) }, { gameId: "fake-game" }, { title: "Fake title" }, { source: "profiles" }, { playSeconds: 999 }, { gameId: "../gulam-chor" }]) {
    await assertFails(setDoc(activityRef(database, "bobby", "invalid"), activityData(extra)));
  }
  await assertFails(setDoc(doc(database, "profiles", "bobby", "stats", "gulam-chor"), { sessions: 99 }));
});

test("community activity requires a published game, its real title and a non-creator launch", async () => {
  await publishGame();
  const database = db("bobby");
  const data = activityData({ source: "communityGames", gameId: "orbit", title: "Orbit" });
  const batch = writeBatch(database);
  batch.set(doc(database, "communityGames", "orbit", "players", "bobby"), { startedAt: serverTimestamp() });
  batch.set(activityRef(database), data);
  await assertSucceeds(batch.commit());
  await assertFails(setDoc(activityRef(db("alice"), "alice"), data));
  await updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: false, updatedAt: serverTimestamp() });
  await assertFails(setDoc(activityRef(database, "bobby", "hidden"), data));
  await assertSucceeds(getDoc(activityRef(database)));
});
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
  // Rules read the reciprocal document. Competing raw writes can both abort;
  // safety requires at most one winner, not that the server picks a winner.
  const successful = outcomes.filter((item) => item.status === "fulfilled").length;
  assert(successful <= 1, "Reciprocal writes must never both succeed");
  for (const outcome of outcomes) if (outcome.status === "rejected") {
    assert(["permission-denied", "aborted"].includes(outcome.reason.code), "Unexpected concurrent-write error: " + outcome.reason.code);
  }
  const connections = async () => (await getDocs(query(
    collection(db("alice"), "friendships"), where("members", "array-contains", "alice"),
  ))).docs.map((item) => item.data());
  assert.equal((await connections()).length, successful, "Rejected writes must not leave a connection");
  if (!successful) await assertSucceeds(setDoc(requestRef(db("alice")), requestData("alice", "bobby")));
  const saved = await connections();
  assert.equal(saved.length, 1, "A retry must create exactly one connection");
  const { from, to } = saved[0];
  await assertFails(setDoc(requestRef(db(to), to, from), requestData(to, from)));
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

const communityGame = (extra = {}) => ({ ownerId: "alice", title: "Orbit", kind: "browser", description: "A little space game", url: "https://games.example.com/orbit/", published: true, authMode: "none", coverUrl: "https://images.example.com/cover.jpg", howToPlay: "Play a round", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra });
async function publishGame(extra = {}) {
  await claim("alice");
  await setDoc(doc(db("alice"), "communityGames", "orbit"), communityGame({ ...extra, published: false }));
  await verifyIntegration(extra);
  await updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: true, updatedAt: serverTimestamp() });
}
async function verifyIntegration(extra = {}) {
  const game = communityGame(extra);
  await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), "gameIntegrations", "orbit"), { ownerId: "alice", url: game.url, authMode: game.authMode, enabled: true, verified: true }));
}

test("community listings enforce ownership, schema and safe URLs", async () => {
  await claim("alice");
  for (const database of [anonymous(), db("bobby")]) await assertFails(setDoc(doc(database, "communityGames", "orbit"), communityGame()));
  for (const extra of [{ url: "javascript:alert(1)" }, { url: "http://games.example.com/" }, { url: "https://user:pass@example.com/" }, { title: "" }, { description: "" }, { published: "yes" }, { kind: "unknown" }, { plays: 999 }]) await assertFails(setDoc(doc(db("alice"), "communityGames", "orbit"), communityGame(extra)));
  await assertFails(setDoc(doc(db("alice"), "communityGames", "orbit"), communityGame()));
  await assertSucceeds(setDoc(doc(db("alice"), "communityGames", "orbit"), communityGame({ published: false })));
  await assertFails(updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: true, updatedAt: serverTimestamp() }));
  await verifyIntegration();
  await assertSucceeds(updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: true, updatedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(anonymous(), "communityGames", "orbit")));
  await assertFails(updateDoc(doc(db("bobby"), "communityGames", "orbit"), { title: "Stolen", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(db("alice"), "communityGames", "orbit"), { ownerId: "bobby", updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: false, updatedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(anonymous(), "communityGames", "orbit")));
  await assertSucceeds(getDoc(doc(db("alice"), "communityGames", "orbit")));
});
test("public discovery and creator queries only expose authorized listings", async () => {
  await publishGame();
  await setDoc(doc(db("alice"), "communityGames", "draft"), communityGame({ published: false }));
  const publicGames = await assertSucceeds(getDocs(query(collection(anonymous(), "communityGames"), where("published", "==", true))));
  assert.equal(publicGames.size, 1);
  assert.equal((await assertSucceeds(getDocs(query(collection(db("alice"), "communityGames"), where("ownerId", "==", "alice"))))).size, 2);
  await assertFails(getDocs(collection(anonymous(), "communityGames")));
});
test("launch receipts are immutable, private and cannot be forged for another player", async () => {
  await publishGame();
  const launch = (database, uid = "bobby") => doc(database, "communityGames", "orbit", "players", uid);
  const receipt = () => ({ startedAt: serverTimestamp() });
  await assertFails(setDoc(launch(anonymous()), receipt()));
  await assertFails(setDoc(launch(db("alice")), receipt()));
  await assertFails(setDoc(launch(db("alice"), "alice"), receipt()));
  await assertSucceeds(setDoc(launch(db("bobby")), receipt()));
  await assertFails(setDoc(launch(db("bobby")), receipt()));
  await assertFails(deleteDoc(launch(db("bobby"))));
  await assertFails(getDocs(collection(db("charlie"), "communityGames", "orbit", "players")));
  await assertSucceeds(getDocs(collection(db("alice"), "communityGames", "orbit", "players")));
  await updateDoc(doc(db("alice"), "communityGames", "orbit"), { published: false, updatedAt: serverTimestamp() });
  await assertFails(setDoc(launch(db("charlie"), "charlie"), receipt()));
});
test("reviews require a launch, allow one per player, and creators cannot alter feedback", async () => {
  await publishGame();
  const ref = (database, uid = "bobby") => doc(database, "communityGames", "orbit", "reviews", uid);
  const review = (extra = {}) => ({ rating: 4, text: "Fun game", updatedAt: serverTimestamp(), ...extra });
  await assertFails(setDoc(ref(db("bobby")), review()));
  await setDoc(doc(db("bobby"), "communityGames", "orbit", "players", "bobby"), { startedAt: serverTimestamp() });
  for (const extra of [{ rating: 6 }, { rating: 1.5 }, { text: "" }, { text: "x".repeat(1001) }, { ownerId: "alice" }]) await assertFails(setDoc(ref(db("bobby")), review(extra)));
  await assertSucceeds(setDoc(ref(db("bobby")), review()));
  await assertSucceeds(setDoc(ref(db("bobby")), review({ rating: 5 })));
  await assertFails(setDoc(ref(db("alice")), review()));
  await assertFails(deleteDoc(ref(db("alice"))));
  assert.equal((await getDocs(collection(anonymous(), "communityGames", "orbit", "reviews"))).size, 1);
  await assertSucceeds(deleteDoc(ref(db("bobby"))));
});

 test("download listings are publishable and counted through the same player receipts", async () => {
  await publishGame({ kind: "download", url: "https://games.example.com/download/" });
  assert.equal((await getDoc(doc(anonymous(), "communityGames", "orbit"))).data().kind, "download");
  await assertSucceeds(updateDoc(doc(db("alice"), "communityGames", "orbit"), { kind: "browser", updatedAt: serverTimestamp() }));
});

test("rich game details accept safe media and reject injected or oversized values", async () => {
  await publishGame({ coverUrl: "https://images.example.com/cover.jpg", screenshots: ["https://images.example.com/play.jpg"], howToPlay: "Explore and reach the goal", controls: "WASD", requirements: "Modern browser", genre: "Adventure" });
  const ref = doc(db("alice"), "communityGames", "orbit");
  for (const extra of [{ coverUrl: "javascript:alert(1)" }, { coverUrl: 5 }, { screenshots: ["http://unsafe.example.com/image.jpg"] }, { screenshots: Array(7).fill("https://images.example.com/play.jpg") }, { screenshots: "not a list" }, { howToPlay: "x".repeat(3001) }, { controls: 7 }, { requirements: "x".repeat(1001) }, { genre: "x".repeat(61) }]) {
    await assertFails(updateDoc(ref, { ...extra, updatedAt: serverTimestamp() }));
  }
  await assertSucceeds(updateDoc(ref, { published: false, coverUrl: "", screenshots: [], updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(db("bobby"), "communityGames", "orbit"), { coverUrl: "https://images.example.com/fake.jpg", updatedAt: serverTimestamp() }));
});

test("official games share review protections without allowing counterfeit games or public receipts", async () => {
  const review = (database, uid = "bobby", game = "bap-ka-rasta") => doc(database, "officialGames", game, "reviews", uid);
  const launch = (database, uid = "bobby", game = "bap-ka-rasta") => doc(database, "officialGames", game, "players", uid);
  const data = () => ({ rating: 5, text: "Great drive", updatedAt: serverTimestamp() });
  await assertFails(setDoc(review(db("bobby")), data()));
  await assertFails(setDoc(launch(anonymous()), { startedAt: serverTimestamp() }));
  await assertFails(setDoc(launch(db("alice")), { startedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(launch(db("bobby")), { startedAt: serverTimestamp() }));
  await assertFails(setDoc(launch(db("bobby")), { startedAt: serverTimestamp() }));
  await assertFails(getDoc(launch(anonymous())));
  await assertSucceeds(setDoc(review(db("bobby")), data()));
  await assertSucceeds(getDoc(review(anonymous())));
  await assertSucceeds(setDoc(review(db("bobby")), { ...data(), rating: 3 }));
  await assertFails(setDoc(review(db("bobby")), { ...data(), rating: 5.5 }));
  await assertFails(setDoc(review(db("alice")), data()));
  await assertFails(deleteDoc(review(db("alice"))));
  await assertFails(setDoc(review(db("bobby"), "bobby", "gulam-chor"), data()));
  await assertFails(setDoc(launch(anonymous(), "bobby", "gulam-chor"), { startedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(launch(db("bobby"), "bobby", "gulam-chor"), { startedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(review(db("bobby"), "bobby", "gulam-chor"), { ...data(), text: "One more round!" }));
  await assertSucceeds(getDoc(review(anonymous(), "bobby", "gulam-chor")));
  await assertFails(getDoc(launch(anonymous(), "bobby", "gulam-chor")));
  await assertFails(setDoc(review(db("alice"), "bobby", "gulam-chor"), data()));
  await assertFails(deleteDoc(review(db("alice"), "bobby", "gulam-chor")));
  await assertFails(setDoc(launch(db("bobby"), "bobby", "fake-game"), { startedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("bobby"), "officialGames", "bap-ka-rasta"), { published: true }));
  await assertSucceeds(deleteDoc(review(db("bobby"))));
});


test("private integration records deny client writes and cross-player reads", async () => {
  await publishGame();
  for (const name of ["gameStats", "sessions", "connections", "saves"]) {
    const ref = doc(db("bobby"), "players", "bobby", name, "orbit");
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), "players", "bobby", name, "orbit"), { value: 1 }));
    await assertSucceeds(getDoc(ref));
    await assertFails(setDoc(ref, { value: 999 }));
    await assertFails(getDoc(doc(db("alice"), "players", "bobby", name, "orbit")));
    await assertFails(getDoc(doc(anonymous(), "players", "bobby", name, "orbit")));
  }
  await assertFails(setDoc(doc(db("alice"), "gameIntegrations", "orbit"), { verified: true }));
  await assertSucceeds(getDoc(doc(db("alice"), "gameIntegrations", "orbit")));
  await assertFails(getDoc(doc(db("bobby"), "gameIntegrations", "orbit")));
  for (const name of ["gameCodes", "gameTokens", "gameRateLimits"]) {
    await assertFails(getDoc(doc(db("alice"), name, "anything")));
    await assertFails(setDoc(doc(db("alice"), name, "anything"), { uid: "alice" }));
  }
});

test("publishing rejects changed origins, changed access modes and missing guide content", async () => {
  await publishGame();
  const ref = doc(db("alice"), "communityGames", "orbit");
  for (const extra of [{ url: "https://other.example.com/" }, { authMode: "vihar-id" }, { coverUrl: "" }, { howToPlay: "" }]) {
    await assertFails(updateDoc(ref, { ...extra, updatedAt: serverTimestamp() }));
  }
  await assertSucceeds(updateDoc(ref, { published: false, url: "https://other.example.com/", updatedAt: serverTimestamp() }));
});
