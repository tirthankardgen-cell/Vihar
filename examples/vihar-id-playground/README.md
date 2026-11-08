# Local Vihar ID playground

This is an independent studio-style test website. It uses the real browser SDK and local Vihar API with isolated Firebase Auth and Firestore emulators. Nothing is written to production.

## Start

Use Node.js 26 and Java 21 or newer. Install repository dependencies with `npm ci`, then run from the repository root:

```sh
npm run playground
```

On this Windows checkout, the launcher can use the Node 26 and Java 21 runtimes already available under the ignored `output` directory:

```powershell
.\Start-Vihar-ID-Playground.ps1
```

Open **http://127.0.0.1:4195**. The local Vihar website runs at **http://127.0.0.1:4194**. Use these exact origins: registration and popup approval are origin-bound.

| Local account | Email | Password |
| --- | --- | --- |
| Player | `player@example.test` | `Vihar-demo-123` |
| Studio owner | `studio@example.test` | `Vihar-demo-123` |

These are deliberately public emulator credentials, not production accounts. You can also create a different local account in the Vihar popup. Do not enter a real account password.

## Try the complete flow

1. Leave **Account & saved progress** selected and click **Sign in with Vihar ID**. The button includes the official Vihar icon. Use the button selector to preview dark, light and compact versions.
2. In the Vihar popup, sign in using the local player account above. Approve the connection and return to the playground.
3. Choose **Fetch player data**. Inspect `sub`, `gameId`, `username`, `displayName` and `avatarId`. Email, password and other games' private data are not included.
4. Choose **Load progress** to retrieve the latest revision. Edit the JSON object, then **Save progress**. Reload the page and load it again to confirm persistence during this emulator run.
5. Choose **Try an outdated revision** after saving. The service returns `save_conflict` without overwriting your checkpoint. Load again before the next write.
6. Choose **Start playing**, wait at least 15 seconds, pause, resume and finish. The SDK excludes hidden and paused intervals. The timer shows this tab's active time; the dashboard shows time actually credited by the server.
7. Open **Player dashboard** to inspect per-game time and sessions. **Connections & data export** lets you disconnect the game or export your local data.
8. Choose **Sign out of this game**. Identity access ends, while the save remains for the next sign-in. Signing out of the game does not sign you out of the local Vihar website.

## Direct play and studio analytics

Select **Direct play** to remove the in-game sign-in button. You can start a guest round immediately; guest time is not attached to a personal dashboard. To test attribution without an in-game login, choose **Launch from local Vihar**, sign in on Vihar if needed, and press its **Play game** button. The newly opened playground consumes the activity ticket automatically. Identity and save operations in this mode intentionally fail with `identity_required`.

Use the studio account on local Vihar to inspect Creator studio's Content and Analytics views. The two seeded demo listings are owned by that account. Its own integration-test sessions are excluded from creator metrics, so use the player account to generate analytics.

The seeded listings permit a loopback game URL only in this emulator fixture. Real community publishing still requires an HTTPS studio origin, the correct access mode, and a successful owner integration test.

## Stop and troubleshoot

- Press **Ctrl+C in the launcher terminal** to stop its services. Emulator accounts, saves and activity are temporary and reset when the launcher stops.
- Logs are saved in `output/playground/firebase.log` and `output/playground/next.log`, outside Git.
- Close another Next development server for this checkout before launching. The playground uses the normal development build directory.
- The launcher checks ports 4194, 4195, 19399, 19380, 19422, 19522 and 19523 before starting; it does not kill an unrelated process using one of those ports.
- Allow popups for `127.0.0.1:4195`. Keep the original game tab open until approval returns.
- An expired launch ticket can be replaced by launching from local Vihar again. Account games can also reconnect through their sign-in button.
- `session_active` means another tab is still reporting the same player/game. Finish that session or wait 90 seconds after its last heartbeat.
- The first emulator launch may download Firebase's emulator binaries and take longer. Java 21+ and network access are required for that first download.

The request journal displays operation results and error codes without displaying authorization codes, access tokens or Firebase credentials. The local server binds only to loopback and sends `noindex` headers. The playground is not a production Next.js route.
