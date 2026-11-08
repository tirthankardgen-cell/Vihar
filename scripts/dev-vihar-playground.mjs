import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "output", "playground");
const ports = { vihar: 4194, studio: 4195, auth: 19399, firestore: 19380, hub: 19422, logging: 19522, websocket: 19523 };
const platformOrigin = `http://127.0.0.1:${ports.vihar}`;
const studioOrigin = `http://127.0.0.1:${ports.studio}`;
const password = "Vihar-demo-123";
const children = [];
let server, stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  server?.close();
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // Terminate only process trees started by this launcher.
    if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    else { try { process.kill(-child.pid, "SIGTERM"); } catch { /* Already stopped. */ } }
  }
  console.log("Local Vihar ID playground stopped. Its temporary emulator data is discarded.");
  process.exit(code);
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

function launch(name, args, env) {
  const log = createWriteStream(path.join(output, `${name}.log`), { flags: "w" });
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true, detached: process.platform !== "win32" });
  child.stdout.pipe(log); child.stderr.pipe(log);
  children.push(child);
  child.on("error", (error) => { console.error(`${name}: ${error.message}`); void stop(1); });
  child.on("exit", (code) => { if (!stopping) { console.error(`${name} exited (${code}). See output/playground/${name}.log. Close any other Next dev process before retrying.`); void stop(1); } });
  return child;
}
async function waitFor(url, child) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw new Error("A local service exited before becoming ready.");
    try { const response = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (response.status < 500) return; } catch { /* Starting. */ }
    await delay(1000);
  }
  throw new Error(`Local service did not become ready: ${url}. Check output/playground logs.`);
}
async function available(port) {
  await new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once("error", () => reject(new Error(`Port ${port} is already in use. Stop its existing service before starting the playground.`)));
    probe.listen(port, "127.0.0.1", () => probe.close(resolve));
  });
}

async function main() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new Error("The playground runs locally only.");
  if (Number(process.versions.node.split(".")[0]) < 26) throw new Error("Use Node.js 26. On this Windows checkout, run ./Start-Vihar-ID-Playground.ps1 to use the available local runtime.");
  const java = spawnSync("java", ["-version"], { encoding: "utf8", windowsHide: true });
  const major = Number(`${java.stderr}${java.stdout}`.match(/version "(\d+)/)?.[1]);
  if (java.error || major < 21 || !major) throw new Error("Install Java 21+ or use Start-Vihar-ID-Playground.ps1 with the available local Java runtime.");
  if (!existsSync(path.join(root, "node_modules", "next"))) throw new Error("Run npm ci first.");
  await Promise.all(Object.values(ports).map(available));
  await mkdir(output, { recursive: true });
  const env = { ...process.env, NODE_ENV: "development", VIHAR_ID_EMULATOR: "true", NEXT_PUBLIC_FIREBASE_EMULATORS: "true", NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-vihar", NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: String(ports.auth), NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT: String(ports.firestore), FIREBASE_AUTH_EMULATOR_HOST: `127.0.0.1:${ports.auth}`, FIRESTORE_EMULATOR_HOST: `127.0.0.1:${ports.firestore}` };
  // Never pass production server credentials into local children.
  for (const key of ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY", "GOOGLE_APPLICATION_CREDENTIALS"]) env[key] = "";
  await writeFile(path.join(output, "firebase.json"), JSON.stringify({ firestore: { rules: path.join(root, "firestore.rules") }, emulators: { auth: { host: "127.0.0.1", port: ports.auth }, firestore: { host: "127.0.0.1", port: ports.firestore, websocketPort: ports.websocket }, hub: { host: "127.0.0.1", port: ports.hub }, logging: { host: "127.0.0.1", port: ports.logging }, ui: { enabled: false }, singleProjectMode: true } }, null, 2));
  console.log("Starting isolated Auth and Firestore emulators…");
  const firebase = launch("firebase", [path.join(root, "node_modules/firebase-tools/lib/bin/firebase.js"), "emulators:start", "--config", path.join(output, "firebase.json"), "--project", "demo-vihar", "--only", "auth,firestore"], env);
  await Promise.all([waitFor(`http://${env.FIREBASE_AUTH_EMULATOR_HOST}`, firebase), waitFor(`http://${env.FIRESTORE_EMULATOR_HOST}`, firebase)]);
  Object.assign(process.env, { VIHAR_ID_EMULATOR: "true", FIREBASE_AUTH_EMULATOR_HOST: env.FIREBASE_AUTH_EMULATOR_HOST, FIRESTORE_EMULATOR_HOST: env.FIRESTORE_EMULATOR_HOST });
  const { getAdmin } = await import("../src/lib/firebase/admin.ts");
  const { Timestamp } = await import("firebase-admin/firestore");
  const { db, auth } = getAdmin();
  for (const role of ["player", "studio"]) {
    const uid = `playground-${role}`, username = `${role}_demo`;
    await auth.createUser({ uid, email: `${role}@example.test`, password, emailVerified: true });
    await db.doc(`profiles/${uid}`).set({ uid, username, displayName: role === "player" ? "Demo Player" : "Demo Studio", bio: "Local playground account", avatarId: "sun", createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    await db.doc(`usernames/${username}`).set({ uid });
  }
  for (const mode of ["account", "direct"]) {
    const id = `playground-${mode}`, url = `${studioOrigin}/?game=${id}`, authMode = mode === "account" ? "vihar-id" : "none";
    await db.doc(`communityGames/${id}`).set({ title: mode === "account" ? "Playground · Account game" : "Playground · Direct play", description: "A local demonstration of Vihar ID. Try identity, game saves and play tracking without production data.", ownerId: "playground-studio", url, kind: "browser", published: true, authMode, coverUrl: "https://vihar.online/images/gulam-chor/landing.webp", screenshots: [], howToPlay: "Use the playground controls to start, pause and finish a session.", controls: "Mouse, keyboard or touch", requirements: "A current browser", genre: "Developer playground", createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    await db.doc(`gameIntegrations/${id}`).set({ ownerId: "playground-studio", origin: studioOrigin, url, authMode, enabled: true, verified: true, updatedAt: Timestamp.now() });
  }
  await db.terminate();
  const files = new Map([["/", ["index.html", "text/html; charset=utf-8"]], ["/playground.js", ["playground.js", "text/javascript; charset=utf-8"]], ["/playground.css", ["playground.css", "text/css; charset=utf-8"]]]);
  server = createServer(async (request, response) => {
    if (request.headers.host !== new URL(studioOrigin).host) { response.writeHead(403).end("Use the localhost URL printed by the launcher."); return; }
    const pathname = new URL(request.url, studioOrigin).pathname;
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    if (request.method !== "GET") { response.writeHead(405).end(); return; }
    if (pathname === "/config.json") { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ platformOrigin, games: { account: "playground-account", direct: "playground-direct" }, accounts: { player: "player@example.test", studio: "studio@example.test", password } })); return; }
    const file = files.get(pathname);
    if (!file) { response.writeHead(404).end(); return; }
    try { response.setHeader("Content-Type", file[1]); response.end(await readFile(path.join(root, "examples/vihar-id-playground", file[0]))); }
    catch { response.writeHead(500).end("The playground file could not load."); }
  });
  await new Promise((resolve) => server.listen(ports.studio, "127.0.0.1", resolve));
  console.log("Starting the local Vihar website…");
  const next = launch("next", [path.join(root, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(ports.vihar)], env);
  await waitFor(platformOrigin + "/login", next);
  console.log(`\nVihar ID playground: ${studioOrigin}\nLocal dashboard: ${platformOrigin}/dashboard\nPlayer: player@example.test\nStudio: studio@example.test\nDemo password: ${password}\n\nUse these LOCAL accounts in the popup. Production accounts are separate.\nPress Ctrl+C to stop all playground services. Logs: output/playground/`);
}
main().catch((error) => { console.error(error.message); void stop(1); });
