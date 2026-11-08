const byId = (id) => document.getElementById(id);
const print = (value) => JSON.stringify(value, null, 2);
let client, unmountButton, config, mode = "account", revision = 0, busy = false, player = null, session = false, playing = false, milliseconds = 0, tickAt = performance.now();
function mountButton() {
  unmountButton?.();
  const variant = byId("button-theme").value;
  unmountButton = client.mount("#identity-button", { theme: variant === "light" ? "light" : "dark", compact: variant === "compact" });
}
byId("button-theme").onchange = mountButton;
function feedback(message, error = false) { byId("feedback").textContent = message; byId("feedback").classList.toggle("error", error); }
function journal(operation, value, failed = false) {
  byId("journal").querySelector(".empty")?.remove();
  const item = document.createElement("li"), heading = document.createElement("div"), name = document.createElement("strong"), time = document.createElement("time"), detail = document.createElement("pre");
  heading.className = "journal-heading"; name.textContent = operation; name.classList.toggle("failed", failed);
  time.dateTime = new Date().toISOString(); time.textContent = new Date().toLocaleTimeString();
  detail.textContent = print(value ?? { completed: true }); heading.append(name, time); item.append(heading, detail); byId("journal").prepend(item);
  while (byId("journal").children.length > 25) byId("journal").lastElementChild.remove();
}
function controls() {
  for (const id of ["get-player", "save-progress", "load-progress", "stale-save", "sign-out", "start-play"]) byId(id).disabled = busy || !client;
  byId("game-mode").disabled = busy || !client;
  byId("button-theme").disabled = busy || !client;
  byId("pause-play").disabled = busy || !session || !playing;
  byId("resume-play").disabled = busy || !session || playing;
  byId("stop-play").disabled = busy || !session;
  byId("start-play").disabled = busy || !client || session;
}
async function action(name, work) {
  if (busy || !client) return;
  busy = true; controls();
  try { const result = await work(); journal(name, result); feedback(`${name} completed.`); return result; }
  catch (error) { journal(name, { error: error.code || "request_failed", message: error.message }, true); feedback(error.message, true); }
  finally { busy = false; controls(); }
}
function identity(value) {
  player = value;
  byId("player-data").textContent = value ? print(value) : "No player identity is available to this game. Use Sign in with Vihar ID for an account game.";
  byId("identity-badge").textContent = value ? `@${value.username}` : "Not signed in";
  byId("identity-badge").classList.toggle("connected", !!value);
  byId("connection-status").textContent = value ? "Identity connected" : "No identity connection";
}
function accumulate(visible = document.visibilityState === "visible") {
  const now = performance.now();
  if (playing && visible) milliseconds += now - tickAt;
  tickAt = now;
  const seconds = Math.floor(milliseconds / 1000);
  byId("play-clock").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
let wasVisible = document.visibilityState === "visible";
document.addEventListener("visibilitychange", () => { accumulate(wasVisible); wasVisible = document.visibilityState === "visible"; });
setInterval(() => accumulate(), 1000);
function progress() {
  const data = JSON.parse(byId("save-editor").value);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Progress must be a JSON object.");
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 60000) throw new Error("Keep the save under 60 KB.");
  return data;
}
function saveResult(result) { revision = result.revision; byId("revision").textContent = revision; byId("save-data").textContent = print(result); }
byId("get-player").onclick = () => action("Fetch player", async () => { const value = await client.getPlayer(); identity(value); return value; });
byId("load-progress").onclick = () => action("Load progress", async () => { const result = await client.loadProgress(); saveResult(result); if (result.data) byId("save-editor").value = print(result.data); return result; });
byId("save-progress").onclick = () => action("Save progress", async () => { const result = await client.saveProgress(progress(), revision); saveResult(result); return result; });
byId("stale-save").onclick = () => action("Outdated revision test", async () => {
  if (revision < 1) throw new Error("Save a checkpoint first, then try its previous revision.");
  return client.saveProgress(progress(), revision - 1);
});
byId("start-play").onclick = () => action("Start playing", async () => {
  if (mode === "account" && !player) throw new Error("This example account game needs Vihar ID sign-in before gameplay. Switch to Direct play to test a guest session.");
  const result = await client.startSession(); session = true; playing = true; milliseconds = 0; tickAt = performance.now();
  byId("play-state").textContent = result.guest ? "Guest · not recorded" : "Playing · reporting";
  byId("session-data").textContent = print(result); return result;
});
byId("pause-play").onclick = () => action("Pause", () => { accumulate(); playing = false; client.setPlaying(false); byId("play-state").textContent = "Paused"; });
byId("resume-play").onclick = () => action("Resume", () => { accumulate(); playing = true; client.setPlaying(true); byId("play-state").textContent = "Playing"; });
byId("stop-play").onclick = () => action("Finish session", async () => { accumulate(); playing = false; await client.stopSession(); session = false; byId("play-state").textContent = "Finished"; return { activeTimeInThisTabMs: Math.floor(milliseconds), nextStep: "Open the local dashboard to inspect server-recorded time." }; });
byId("sign-out").onclick = () => action("Sign out", async () => {
  try { await client.signOut(); }
  finally { accumulate(); playing = false; session = false; identity(null); revision = 0; byId("revision").textContent = "0"; byId("play-state").textContent = "Signed out"; byId("save-data").textContent = "Signed out. Server saves are retained for the next sign-in."; }
  return { signedOut: true, savedProgressRetained: true };
});
// eslint-disable-next-line @next/next/no-location-assign-relative-destination -- This standalone studio page runs outside the Next.js router.
byId("game-mode").onchange = async () => { if (client) await client.stopSession(); location.href = `/?game=${config.games[byId("game-mode").value]}`; };
byId("clear-journal").onclick = () => { byId("journal").replaceChildren(); };
async function start() {
  config = await fetch("/config.json").then((response) => response.json());
  const requested = new URLSearchParams(location.search).get("game");
  mode = requested === config.games.direct ? "direct" : "account";
  const gameId = config.games[mode];
  byId("game-mode").value = mode; byId("game-id").textContent = gameId;
  byId("button-options").hidden = mode !== "account";
  byId("mode-description").textContent = mode === "account" ? "Games with accounts or saved progress show Vihar ID sign-in on their own website." : "No in-game sign-in is needed. A signed-in launch from local Vihar attaches activity to the player’s dashboard.";
  for (const [id, route] of Object.entries({ "launch-link": `/community/${gameId}`, "dashboard-link": "/dashboard", "creator-link": "/dashboard/publish", "settings-link": "/dashboard/settings", "guide-link": "/help/browser-sdk" })) byId(id).href = config.platformOrigin + route;
  byId("player-email").textContent = config.accounts.player; byId("studio-email").textContent = config.accounts.studio; byId("demo-password").textContent = config.accounts.password;
  // Refresh local SDK edits even if this browser cached an earlier version.
  const { createViharId } = await import(`${config.platformOrigin}/sdk/vihar-id.js?playground=${Date.now()}`);
  client = createViharId({ gameId, baseUrl: config.platformOrigin, onError: (error) => { journal("SDK report", { error: error.code, message: error.message }, true); feedback(error.message, true); } });
  let connected = false, launchError = "";
  try { connected = await client.resumeLaunch(); }
  catch (error) { launchError = error.message; journal("Resume launch", { error: error.code, message: error.message }, true); }
  if (mode === "account") {
    mountButton();
    byId("identity-button").addEventListener("vihar:signin", (event) => { identity(event.detail); journal("Sign in", event.detail); feedback("Connected. Fetch player data, load a save, or start playing."); });
  }
  if (client.getAccessToken()) { try { identity(await client.getPlayer()); } catch (error) { feedback(error.message, true); } }
  else byId("connection-status").textContent = connected ? "Activity-only connection" : "Guest · no connection";
  controls(); feedback(launchError || (connected ? "Connection restored. Choose an operation below." : "Ready. Start with the Vihar ID button or try Direct play."), !!launchError);
}
start().catch((error) => { feedback(`Could not initialize the playground: ${error.message}`, true); journal("Startup", { error: error.message }, true); });
