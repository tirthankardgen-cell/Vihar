# Vihar ID game integration

Vihar ID connects a self-hosted community game to the player's existing account. The player opens the studio's website from Vihar; account games show **Sign in with Vihar ID on that website**. Game files stay on the studio's hosting.

## Publishing requirements

| Game behavior | Required integration |
| --- | --- |
| No accounts or saved player progress | Activity SDK; no in-game login gate |
| Accounts, login or saved player progress | Visible Vihar ID sign-in and sign-out, identity connection, activity SDK |
| Cloud progress through Vihar | Identity connection plus explicit load/save hooks |

Save a private listing first. Register its exact HTTPS origin from Content in Creator studio, install the SDK on that host, and run the owner test. A credited gameplay heartbeat verifies tracking; account games must test with an identity token. Firestore only permits publication when the registered URL and access mode match the listing and the integration is enabled and verified. URL or access-mode changes require a new test. Legacy listings remain readable during migration.

The requirement to display the button and report actual gameplay is a publisher obligation. The automated test demonstrates a successful integration request; it does not inspect every future studio build or prove that a user was paying attention.

## Studio quick start

```html
<div id="vihar-login"></div>
<button id="vihar-signout" type="button">Sign out of this game</button>
<p id="vihar-status" role="status"></p>
<script type="module">
  import { createViharId } from "https://vihar.online/sdk/vihar-id.js";
  const status = document.querySelector("#vihar-status");
  const id = createViharId({
    gameId: "YOUR_SAVED_GAME_ID",
    onError: (error) => { status.textContent = error.message; }
  });
  try { await id.resumeLaunch(); }
  catch (error) { status.textContent = error.message; }
  id.mount("#vihar-login");
  document.querySelector("#vihar-login").addEventListener("vihar:signin", async () => {
    try {
      const { data, revision } = await id.loadProgress();
      // Restore your engine from data; keep revision for the next save.
      // Call await id.startSession() when gameplay actually begins.
    } catch (error) { status.textContent = error.message; }
  });
  document.querySelector("#vihar-signout").onclick = async () => {
    try { await id.signOut(); status.textContent = "Signed out"; }
    catch { status.textContent = "Signed out locally. Disconnect this game in Vihar settings if remote sign-out failed."; }
    // Clear your engine's account state and end your studio's own session too.
  };
  // Wire your engine's real events:
  // await id.startSession();            // begin gameplay
  // id.setPlaying(false);              // pause/menu
  // id.setPlaying(true);               // resume
  // await id.saveProgress({level: 2}, revision); // checkpoint; retain returned revision
  // await id.stopSession();            // finish
</script>
```

Direct-play games omit the identity widget and save methods. Keep `resumeLaunch` and the lifecycle hooks. A guest receives `{ guest: true }` from `startSession` and can play immediately. Personal dashboard attribution needs a signed-in Vihar launch or an approved identity connection. Historical guest activity is not backfilled.

## Protocol and permissions

The browser opens `/auth/connect` with the game ID, exact origin, random state and S256 PKCE challenge. Vihar asks the player to approve identity, game-specific saves and play reporting. A one-use, 60-second code returns only to the requesting popup opener. The studio exchanges it with its verifier for an opaque, game-scoped token valid for 12 hours. Tokens and codes are hashed at rest. This is a dedicated game protocol, not a general OpenID Connect provider.

Signed-in launches use an activity-only ticket in the URL fragment. The SDK removes that suffix before exchange and preserves existing hash routes. Activity credentials cannot read identity or saves. Neither type exposes email, password, friends or another game's private records.

All API calls use `POST /api/vihar-id/{action}`, JSON containing `gameId`, and the scoped token in `Authorization: Bearer` for authenticated game operations:

| Action | Input / result |
| --- | --- |
| `me` | Public `sub`, `username`, `displayName`, `avatarId` and game ID |
| `save` | `operation: read` returns `{data, revision}`; `write` requires `data` and the last revision |
| `session` | `start`, `pulse` or `end`, random `sessionId`; pulses/end also send increasing `sequence` and `elapsedMs` |
| `revoke` | Revokes the current token |

The studio backend can call these endpoints without an Origin header but must configure its expected game ID and verify the token with `me` before trusting `sub`. It must reverify expiration/revocation and manage its own secure session. Never send Vihar Firebase credentials to a studio. Native games need the studio's own secure website-to-app handoff and actual gameplay reporter; the SDK itself is for browsers.

## Activity and saves

Heartbeats run every 15 seconds. The SDK excludes hidden and explicitly paused intervals; the server bounds reports by wall time, credits no more than 45 seconds per pulse, discards gaps over 90 seconds, deduplicates sequence numbers and permits one active session per player/game. Reports are estimates from a connected game, not anti-cheat evidence. Owner tests do not increase creator totals. Website opens remain separately labeled.

Saves are JSON objects below 60 KB, scoped to player and game. Revision conflicts return `save_conflict`; reload and merge deliberately. Client-writable saves are unsuitable for authoritative currencies, purchases or competitive scores. Disconnect increments the connection version, invalidating outstanding codes and tokens while retaining saves and history.

## Vihar ID button and icon

`vihar.mount("#vihar-login")` includes the official Vihar emblem and the label **Sign in with Vihar ID**. Use `vihar.mount("#vihar-login", { theme: "light" })` for a light button, or `{ theme: "dark", compact: true }` for just the button and its accessible status message. With `compact`, put the identity explanation and permissions link elsewhere on your login screen.

Studios may use the official [dark emblem](https://vihar.online/brand/vihar-emblem.svg) on light backgrounds and [light emblem](https://vihar.online/brand/vihar-emblem-inverse.svg) on dark backgrounds in their own sign-in buttons. Keep the icon square, at least 20px, alongside the full label; do not replace the label with an icon alone. The [button guide](https://vihar.online/help/brand-button) includes working HTML and styling. Sign-in, account creation and game consent stay in a compact Vihar popup; credentials never pass through the studio website.

## Operation and verification

Use `npm run playground` for a standalone local studio site with the real SDK, player-data inspector, save editor, conflict test and gameplay controls. It starts isolated Firebase emulators and a local Vihar website. See the [local playground guide](../examples/vihar-id-playground/README.md) for launch instructions and demo accounts.

The server uses Firebase Admin credentials described in [Deployment](DEPLOYMENT.md). Firestore browser rules deny writes to integrations, tokens, codes, saves, sessions and aggregate metrics. The server validates ownership, registered origins, scoped access, publication, versions, expiry and input limits.

`npm run test:vihar-id` covers the protocol and browser SDK. `npm run test:integration` uses isolated Auth/Firestore emulators for registration, PKCE exchange, access isolation, concurrent saves, time accounting and revocation. `npm run test:rules` covers database authorization. `npm run verify` checks rendered help pages, canonical URLs, schemas, discovery links, SDK delivery and private route headers.

Configure Firestore TTL on `expiresAt` for `gameCodes`, `gameTokens`, `gameRateLimits` and the `sessions` collection group if available on the project's plan. Token/code expiry is enforced even before physical cleanup. Aggregate statistics and saves remain until removed through account support; never delete those as transient data.

Public, indexed guides start at [Help & support](https://vihar.online/help), including browser setup, backend verification, branding, cloud saves, permissions, publishing, discovery and troubleshooting.
