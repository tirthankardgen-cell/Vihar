# Vihar development record

The single project handoff, operating guide, decision record and development log. Read this file and `AGENTS.md` before making changes. The current-state sections below supersede historical entries; historical claims describe what was known and tested at the time.

## Mandatory maintenance

Every agent and contributor must update this file in the same change as their work. Update affected current-state guidance and add a dated entry under **Change log** containing **Author**, **Request**, **Changes**, **Decisions**, **Validation**, and **Release**. Explain why the change was needed and why the implementation was chosen. Record exact commands and outcomes, including failures, skipped checks, limitations and follow-up work. Never claim a check passed without running it.

Do not create another developer guide, changelog, handoff, task report or permanent test-results document. Keep README.md as the public introduction and quick start; keep AGENTS.md as the short set of mandatory working instructions. License and third-party notices remain separate because they carry ownership and attribution requirements. Temporary evidence belongs in ignored `output/` and should be removed after review. Never put credentials, account tokens or private user data in this log.

`npm run check:log` checks the working changes. The **Development log** GitHub Actions job checks every pull request and push to `main` for a changed log and a newly added entry with the required fields. GitHub checks complement these instructions; they cannot judge the accuracy of a written claim.

## Contents

- [Project and product](#project-and-product)
- [Local development](#local-development)
- [Architecture and data](#architecture-and-data)
- [Vihar ID integration](#vihar-id-integration)
- [Discovery and indexing](#discovery-and-indexing)
- [Production operations](#production-operations)
- [Validation and contribution workflow](#validation-and-contribution-workflow)
- [Assets and repository hygiene](#assets-and-repository-hygiene)
- [Security and support](#security-and-support)
- [Change log](#change-log)
- [Historical record](#historical-record)

## Project and product

| Item | Current value |
| --- | --- |
| Website | https://vihar.online |
| Repository | https://github.com/tirthankardgen-cell/Vihar |
| Production branch and hosting | `main`, existing Vercel project, Next.js preset |
| Framework/runtime | Next.js App Router 16.4, React 19, TypeScript, Node.js 26.x |
| Identity and database | Firebase Authentication and Cloud Firestore, project `vihar-27` |
| Released Vihar games | Bap Ka Rasta at https://rasta.vihar.online; Gulam Chor at https://gulamchor.vihar.online |
| Support | contact@vihar.online |

Vihar is a discovery and publishing platform for VIHAR Originals and independently hosted Community Games. It hosts listings, player accounts, reviews and Vihar ID services; game binaries, engines and downloads remain on their creators' websites. Preserve this boundary. The internal “YouTube of games” analogy describes creator discovery, not a promise of video hosting or uploading game binaries.

Public pages use warm ivory, graphite, terracotta, DM Sans and Newsreader. Player cards use charcoal and muted gold. Preserve the official Vihar emblem, distinguish actual screenshots/model renders from promotional artwork, keep motion restrained and respect reduced-motion settings. Interfaces must support keyboard use, visible focus, meaningful labels and narrow screens. Avoid fictional rankings, reviews, player counts or features.

The external identity popup is a task screen at `/auth/connect`: no discovery header, footer or promotional panels. Credentials, account creation, profile setup and consent stay in the popup. Consent shows the player's compact Vihar ID card, exact game origin, data permissions and adjacent Cancel/Allow buttons. Normal dashboard/profile cards retain their existing flip interaction.

## Local development

Use Node.js **26.x**, pinned by `.nvmrc` and package.json. Java **21+** is needed for Firebase emulator tests. Install dependencies with `npm ci`, copy `.env.example` to ignored `.env.local`, and run `npm run dev`. The normal development site is http://localhost:3000. Public editorial routes work without account configuration; Firebase-backed features need configured services or emulators.

The temporary studio playground and its launcher were removed after the owner's completed review. Ports 4194/4195 and the dedicated review emulators are not permanent project services. Use the maintained emulator commands and integration tests for future development; create temporary browser fixtures only when needed and remove them after review.

For isolated account and Vihar ID API development, start `npm run emulators` in one terminal. Configure the development server in a second terminal with:

```dotenv
NEXT_PUBLIC_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-vihar
VIHAR_ID_EMULATOR=true
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

Then start `npm run dev`. Client emulator ports default to 8080/9099 and can be changed using the two documented `NEXT_PUBLIC_FIREBASE_*_EMULATOR_PORT` values. Keep client and server ports aligned. Restart Next after environment changes. Only use synthetic accounts and data; emulators are not a copy of production. Stop manually running emulators before `test:rules` or `test:integration`, which manage their own test processes. Never enable emulator variables on Vercel; the server rejects emulator mode there.

`.env.example` is the configuration reference. `NEXT_PUBLIC_*` values ship in browser JavaScript and must never contain private credentials. Firebase web identifiers are public configuration; Authentication, Firestore rules and server token checks enforce authorization. Keep `.env.local`, `.vercel`, dependency installs and Git metadata local. Do not remove them as “unused source.”

## Architecture and data

| Location | Responsibility |
| --- | --- |
| `src/app/` | Next.js pages, metadata, route handlers, styles and discovery policy |
| `src/components/` | Shared UI, accounts, cards, creator studio, reviews and carousels |
| `src/lib/account/` | Account schema, data access, activity and publishing helpers |
| `src/lib/vihar-id/` | Origin checks, scoped credentials, game saves and session accounting |
| `src/lib/firebase/` | Browser Firebase setup and server-only Admin SDK initialization |
| `src/lib/help.ts` | Fifteen public, indexed help articles with steps, examples and related topics |
| `public/sdk/vihar-id.js` | The external studio browser SDK |
| `public/` | Production images, fonts, brand assets and crawler verification files |
| `assets/` | Original artwork, capture inputs and campaign source data |
| `scripts/` | Repeatable verification and asset generation |

Server-rendered editorial and public listing content supplies crawlable metadata; client components handle authentication, account subscriptions and interactive publishing. Public community listing reads use Firestore REST and public rules. Private Vihar ID operations use the Admin SDK only on the server. Never import server credential code into client components.

Main routes include `/games`, `/games/originals`, `/games/community`, curated `/games/{slug}` pages, `/community/{id}`, `/dashboard` and its games/publish/friends/settings pages, `/u/{username}`, `/auth/connect`, `/api/vihar-id/{action}`, `/help/{slug}`, `/sitemap.xml` and `/site-map`. Unknown or inaccessible listings return real 404s. Private drafts remain accessible only through authorized creator flows.

| Firestore path | Contract |
| --- | --- |
| `profiles/{uid}`, `usernames/{username}` | Public exact identity reads; atomic, immutable username claim; owner edits only approved profile fields |
| `profiles/{uid}/stats/{gameId}` | Public statistics reserved for trusted backend writers |
| `players/{uid}/favorites/{gameId}` | Private owner-controlled favourites |
| `players/{uid}/activity/{eventId}` | Private, immutable website opens with server timestamps |
| `friendships/{id}` | Participant-only requests, verified sender/recipient writes and cancellation |
| `communityGames/{id}` | Owner-controlled draft/published listing with schema and integration readiness checks |
| `communityGames/{id}/players/{uid}` | First eligible signed-in launch receipt; not verified gameplay |
| `communityGames/{id}/reviews/{uid}` | One editable/deletable review per eligible player; creators cannot alter player feedback |
| `officialGames/{id}/players/{uid}`, `reviews/{uid}` | Equivalent receipt/review contracts for released IDs explicitly allowed in rules |
| `gameIntegrations`, `gameCodes`, `gameTokens`, `gameRateLimits` | Server-owned registrations and short-lived credentials/rate limits |
| `players/{uid}/connections`, `saves`, `sessions`, `gameStats` | Private, game-scoped service records and recorded play totals |

Profiles contain UID, username, display name, bio, avatar and timestamps, never email. Usernames are lowercase, 3–20 characters, begin with a letter and then use letters/digits/underscores; display names allow 1–32 characters and bios up to 160. Availability is advisory until the transaction commits. Provider linking preserves the UID. Firebase persistence is origin-scoped; sharing a Firebase project alone never transfers browser sessions across sites.

Every eligible signed-in launch creates private dated activity and the first review receipt when absent. Guest continuity can restore review eligibility, not historical activity. The activity calendar displays the last 365 UTC days with a 90-day option. Game opens, actual reported play time and trusted game scores are distinct. Connected community play time is private; aggregate creator metrics exclude the creator's own tests. Account export includes private activity and connected-game data without credentials. Account deletion currently uses the support workflow to coordinate Auth, profiles, immutable usernames and related records; do not offer a bare Auth deletion that leaves orphaned data.

The creator workflow is Details → Images & play guide → Preview → Visibility, with Content and Analytics views. Images are external HTTPS URLs; no game binary or arbitrary file upload is provided. New listings must save a draft, register their exact hosting origin and pass the owner integration test before publication. Changes to origin, URL or authentication mode require retesting. Legacy listings remain readable.

## Vihar ID integration

Vihar ID connects a self-hosted community game to the player's existing account. The player opens the studio's website from Vihar; account games show **Sign in with Vihar ID on that website**. Game files stay on the studio's hosting.

### Publishing requirements

| Game behavior | Required integration |
| --- | --- |
| No accounts or saved player progress | Activity SDK; no in-game login gate |
| Accounts, login or saved player progress | Visible Vihar ID sign-in and sign-out, identity connection, activity SDK |
| Cloud progress through Vihar | Identity connection plus explicit load/save hooks |

Save a private listing first. Register its exact HTTPS origin from Content in Creator studio, install the SDK on that host, and run the owner test. A credited gameplay heartbeat verifies tracking; account games must test with an identity token. Firestore only permits publication when the registered URL and access mode match the listing and the integration is enabled and verified. URL or access-mode changes require a new test. Legacy listings remain readable during migration.

The requirement to display the button and report actual gameplay is a publisher obligation. The automated test demonstrates a successful integration request; it does not inspect every future studio build or prove that a user was paying attention.

### Studio quick start

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

### Protocol and permissions

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

### Activity and saves

Heartbeats run every 15 seconds. The SDK excludes hidden and explicitly paused intervals; the server bounds reports by wall time, credits no more than 45 seconds per pulse, discards gaps over 90 seconds, deduplicates sequence numbers and permits one active session per player/game. Reports are estimates from a connected game, not anti-cheat evidence. Owner tests do not increase creator totals. Website opens remain separately labeled.

Saves are JSON objects below 60 KB, scoped to player and game. Revision conflicts return `save_conflict`; reload and merge deliberately. Client-writable saves are unsuitable for authoritative currencies, purchases or competitive scores. Disconnect increments the connection version, invalidating outstanding codes and tokens while retaining saves and history.

### Vihar ID button and icon

`vihar.mount("#vihar-login")` includes the official Vihar emblem and the label **Sign in with Vihar ID**. Use `vihar.mount("#vihar-login", { theme: "light" })` for a light button, or `{ theme: "dark", compact: true }` for just the button and its accessible status message. With `compact`, put the identity explanation and permissions link elsewhere on your login screen.

Studios may use the official [dark emblem](https://vihar.online/brand/vihar-emblem.svg) on light backgrounds and [light emblem](https://vihar.online/brand/vihar-emblem-inverse.svg) on dark backgrounds in their own sign-in buttons. Keep the icon square, at least 20px, alongside the full label; do not replace the label with an icon alone. The [button guide](https://vihar.online/help/brand-button) includes working HTML and styling. Sign-in, account creation and game consent stay in a compact Vihar popup; credentials never pass through the studio website.

### Operation and verification


The server uses Firebase Admin credentials described in [Production operations](#production-operations). Firestore browser rules deny writes to integrations, tokens, codes, saves, sessions and aggregate metrics. The server validates ownership, registered origins, scoped access, publication, versions, expiry and input limits.

`npm run test:vihar-id` covers the protocol and browser SDK. `npm run test:integration` uses isolated Auth/Firestore emulators for registration, PKCE exchange, access isolation, concurrent saves, time accounting and revocation. `npm run test:rules` covers database authorization. `npm run verify` checks rendered help pages, canonical URLs, schemas, discovery links, SDK delivery and private route headers.

Configure Firestore TTL on `expiresAt` for `gameCodes`, `gameTokens`, `gameRateLimits` and the `sessions` collection group if available on the project's plan. Token/code expiry is enforced even before physical cleanup. Aggregate statistics and saves remain until removed through account support; never delete those as transient data.

Public, indexed guides start at [Help & support](https://vihar.online/help), including browser setup, backend verification, branding, cloud saves, permissions, publishing, discovery and troubleshooting.

## Discovery and indexing

Vihar is a game discovery and publishing platform. VIHAR Originals are made by the VIHAR team. Community Games are published by independent creators and players. Cards, game pages, creator profiles, publishing previews and player activity preserve that distinction.

### Discovery

- `/games` presents collection choices, a horizontal Community Top 5 when rated games exist, and recommendations mixing both origins.
- `/games/originals` contains VIHAR's catalogue and its search, category and availability filters.
- `/games/community` contains published community listings and community search. Listings are rendered on the server for readers and crawlers, then refreshed in the browser.
- Rankings use average rating, then review count, with stable title/ID ties. Only published, rated community games enter the Top 5. Unrated games remain discoverable in recommendations and the community collection.
- Recommendations mix both origins by rating and review count, with unrated games after rated games. This is a discovery selection, not personalized behavioral tracking.
- Carousels use native scrolling and scroll snapping, arrow buttons, visible keyboard focus and reduced-motion support. Their scrollbars are hidden. Touch scrolling remains available on phones and tablets.
- Community play opens a new tab so players can return to review. Existing launch eligibility, review ownership and creator restrictions still apply.

No sample games or placeholder rankings are shipped. Temporary QA fixtures use isolated Firebase emulators and are removed after review. Production uses the existing Firebase project.

### Crawlable information

Both collection pages have dedicated canonical URLs, unique metadata, breadcrumbs and CollectionPage/ItemList structured data. Published community pages include VideoGame data and attribute the publisher to their public profile when available. Public profiles and private account pages retain their existing noindex policy.

The XML sitemap includes both collections, substantive public pages and published community games. It includes official artwork, the Vihar logo/favicon, and community cover/screenshot URLs. Daily change-frequency hints express the intended discovery cadence; the sitemap and public listing cache refresh every five minutes. Last-modified values represent actual content changes, not the time a crawler requests a file.

Production robots.txt explicitly allows Bingbot, Googlebot, Googlebot-Image and search/answer crawlers, in addition to its wildcard rule. Images and Next.js image URLs remain crawlable. Preview deployments remain disallowed and noindex. Structured data, visible FAQs and llms.txt describe the same platform behavior without invented reviews, player counts or ranking promises.

### After deployment

1. Verify the canonical `https://vihar.online/sitemap.xml`, `/robots.txt`, `/games/originals`, `/games/community`, `/brand/icon-192.png` and `/indexnow-key.txt` return successful responses.
2. Run `npm run submit:indexnow -- --dry-run` to check the deployed verification key and sitemap. Then run `npm run submit:indexnow` to notify participating search engines, including Bing. The script only submits canonical URLs belonging to this site and never runs during builds. The IndexNow key is public verification material, not a credential.
3. In the verified Google Search Console and Bing Webmaster Tools properties, resubmit the canonical sitemap and inspect affected URLs. Google does not use IndexNow; neither a sitemap nor an accepted submission guarantees indexing, image inclusion or ranking.

For Bing's "page not accessible" error, verify the exact submitted URL, its HTTPS/www redirect chain, DNS and TLS, then check hosting firewall/bot logs for Bing's verified crawler. A successful request with a Bingbot user-agent string does not prove that requests from Bing's own IP addresses are allowed. Do not disable all hosting protections to address an unconfirmed cause.

On 2026-11-08, requests to the production homepage, sitemap, robots file and logo images using Bingbot and Googlebot user agents returned HTTP 200 without an X-Robots-Tag block. An actual Bing crawler denial was not reproduced by those checks.

## Production operations

### AdSense ads.txt status troubleshooting

The root declaration is served by `src/app/ads.txt/route.ts`; keep it available while ad serving is disabled for review. Run `npm run verify:ads-live` (Node and curl required) to check the public publisher entry, text/plain response, canonical destination and HTTP/www redirects, including requests with Google ad-crawler user agents. This read-only diagnostic targets the real production domain; it is separate from local build verification and does not prove requests from Google's network succeed.

If AdSense says “Not found” while these checks pass, open the Vihar site details in AdSense and use the ads.txt check/update option if available. Allow Google to recrawl; do not delete/re-add the site, duplicate ads.txt in public/, or enable ads merely to change the status. Check Vercel firewall/bot logs if the status persists. “Getting ready” is site review, separate from ads.txt discovery. Neither a deploy nor a passing diagnostic guarantees approval or an immediate dashboard update.


The existing Vercel project uses Node.js 26.x, `npm ci`, `npm run build` and the default Next.js output directory. Apex `vihar.online` serves Production; www permanently redirects to it. Set `SITE_URL=https://vihar.online`, authorize the apex in Firebase Authentication, and keep Google/email providers enabled. Do not create a replacement hosting or Firebase project for routine releases.

Production Vihar ID requires encrypted server variables `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, and **`NODE_OPTIONS=--experimental-require-module`**. The Admin 14 JWKS dependency loads ESM-only `jose` from CommonJS; Vercel's serverless runtime needs the Node override or API startup fails with `ERR_REQUIRE_ESM` despite a successful build. Preserve other required Node options. The dedicated service account is `vihar-id-runtime@vihar-27.iam.gserviceaccount.com`, with `roles/datastore.user` and `roles/firebaseauth.viewer`. Keys are encrypted in Vercel, not stored in this repository. Escaped PEM newlines are supported. Keep `VIHAR_ID_EMULATOR` unset/false and `NEXT_PUBLIC_FIREBASE_EMULATORS=false` in deployments.

Firebase CLI account selection matters on the owner's workstation: the account verified for this project is `tirthankar.dgen@gmail.com`; another default login may return 403. Verify current access rather than treating earlier authorization failures in the historical log as current blockers. Compatible Firestore rules were deployed for the Vihar ID release on 8 November 2026. A website push does not deploy database rules.

```sh
npx firebase deploy --project vihar-27 --account tirthankar.dgen@gmail.com --only firestore:rules,firestore:indexes
```

Only deploy rules when the change requires it. Storage is unused for player uploads; `storage.rules` denies access. There is no required Storage migration for the identity or cleanup work. Configure TTL for `expiresAt` on transient codes, tokens, rate limits and sessions where supported. Expiry is enforced by the service even before physical deletion; saves and aggregate statistics are not transient TTL data.

Firebase email templates may use `https://vihar.online/auth/action`. Keep generated `mode` and `oobCode` parameters; the application consumes them with no-referrer handling and refreshes verification claims. Google sign-in uses a popup. `/auth/connect`, `/login`, `/signup` and `/forgot-password` retain `Cross-Origin-Opener-Policy: unsafe-none` for the registered studio opener; game messages are accepted only from the expected origin, window and state. The global policy remains `same-origin-allow-popups`. Do not tighten popup isolation without testing the cross-origin flow.

AdSense remains disabled by default. The public publisher ID and `ads.txt` support ownership verification. All three `ADSENSE_ENABLED`, `ADSENSE_SITE_APPROVED` and `ADSENSE_CONSENT_READY` flags must be true for serving; previews always suppress advertising. Only the completed first-drive guide is an advertising candidate. Discovery, account, support, legal, game-launch and missing pages remain ad-free. `SiteLink` uses full navigation across the advertising boundary so injected ad elements cannot survive into excluded pages. Do not bypass approval/consent controls to satisfy a build or performance check.

For release: run applicable checks, deploy compatible rules first if needed, push the authorized commit, and verify GitHub checks plus Vercel **READY for that exact SHA**. Inspect the canonical website, public guides, SDK, images, noindex/private auth headers and a real server API path. A green build alone does not test Admin SDK startup. Use synthetic emulator data for end-to-end writes; remove any explicitly used ephemeral production Auth smoke account. Never create public test listings or reviews in production.

Rollback uses a known-good deployment in the same Vercel project. Record the SHA, symptoms and mitigation. Website rollback does not roll back database rules or data; evaluate compatibility and avoid deleting user data. Key rotation means installing the new encrypted value, deploying and verifying before revoking the old key.

## Validation and contribution workflow

| Command | What it establishes |
| --- | --- |
| `npm run check:log` | Current changes include the required development entry |
| `npm run check` | ESLint, config/account/community/SDK unit tests, type generation, TypeScript and production build |
| `npm run test:rules` | Firestore authorization contracts against an isolated emulator |
| `npm run test:integration` | Real Auth/Firestore emulator registration, PKCE, token scope, saves, concurrency, play accounting and revocation |
| `npm run verify` | Built HTTP routes, assets, links, metadata/schema, sitemap/robots, private auth headers and ad-policy boundaries |
| `git diff --check` | Whitespace/patch hygiene |

Run `verify` after a successful build. Browser changes also need real mobile/desktop and keyboard checks. For identity work, exercise external-origin popup sign-in, new account/profile setup, cancellation, switching accounts, errors, direct guest play, signed-in activity-only launch, saves/conflicts, pause/hidden time, sign-out and disconnect as affected. For publishing, use separate creator/player/guest accounts to check draft privacy, ownership, reviews and discoverability. Test short windows and long names without hiding essential controls.

Scale checks to the change. Documentation-only work needs link/configuration/log checks; it does not require fabricating test claims or rerunning unrelated integrations. CI runs website checks in review, enabled-ad and preview modes, plus Firebase rules/service tests. Keep these safeguards and existing image/CSS budgets intact. A failed download, timeout, skipped check or unavailable credential is not a passing result.

Contributors retain their rights; this is a proprietary project. Agree permission with maintainers before incorporating work. Use focused changes, explicit types at trust boundaries and the existing architecture. Describe the problem, final behavior, validation and release dependencies in a PR, and update this development record in that same change. User instructions and existing authorization take precedence over routine workflow defaults.

## Assets and repository hygiene

Keep `logo.png`, `assets/original/`, production files under `public/`, the asset scripts, `LICENSE` and `THIRD_PARTY_NOTICES.md`. Favicon verification compares against the original logo pixels. Bundled DM Sans/Newsreader and game fonts retain their licenses. The shared flip-card implementation retains Kokonut UI attribution. Do not redraw brand marks or remove licenses during cleanup.

`npm run assets` regenerates the production artwork pipeline and invokes the game exporters; `npm run assets:avatars` regenerates player portraits. Routine website builds use committed assets and do not need regeneration. Actual Gulam Chor captures live under `assets/original/gulam-chor`; Bap Ka Rasta source art, game captures and vehicle renders remain under `assets/original`. Source provenance and earlier verification are preserved in the historical record.

Campaign source copy/art references now live in `assets/campaigns/launch-2026.json`. `scripts/render-launch-kit.mjs` and `scripts/render-social-campaign.mjs` generate optional promotional exports under ignored `output/launch-kit/`; they are not website build steps. They need an external Playwright installation via `PLAYWRIGHT_MODULE` and a Chromium executable via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Do not add generated posters, contact sheets or ZIP packages back to the source tree.

The completed review removed `examples/vihar-id-playground/`, its local launcher/script, review screenshots/logs/emulator files, redundant root/docs guides, `brand-deliverables/` and generated `launch-kit/` exports. Historical campaigns and exact removed source documents remain recoverable from Git (for example commit `98e0358`). Campaign JSON preserves reusable copy and asset references; unneeded generated promotions are not runtime dependencies. Earlier log references to ignored screenshots and temporary fixtures describe evidence collected then, not artifacts retained now.

Keep `.git`, local `.env.local`, `.vercel` deployment linkage and installed `node_modules` intact. Remove only explicitly resolved workspace paths when cleaning generated output; stop owned processes first. Do not kill unrelated services. The Windows Explorer decoration `desktop.ini` is unnecessary to build or run the project and was removed.

## Security and support

### Security policy

#### Report privately

Email **[contact@vihar.online](mailto:contact@vihar.online)** with the subject **“Security report — Vihar”**. Do not disclose exploitable details, credentials, or personal data in public issues or pull requests.

Include:

- The affected URL, component, and commit or deployment if known.
- A description of the vulnerability and its potential impact.
- Minimal reproduction steps using accounts and data you control.
- Redacted screenshots or logs that help reproduce the issue.
- A contact address for follow-up.

Do not send passwords, access tokens, session cookies, service-account keys, or other users’ data. If sensitive evidence is necessary, first request an appropriate private way to share it.

#### Scope and responsible handling

Reports about Vihar authentication, account data, publishing, Firestore authorization, review ownership, or the production website are relevant. Third-party game hosts and services have their own owners and reporting channels.

Use local emulators where possible. Do not access or modify another person’s data, disrupt service, run denial-of-service tests, or publish a working exploit. Stop if a test exposes data you do not own and report only the minimum information needed to explain the issue. This policy is not authorization for intrusive testing and does not establish a bug-bounty program.

#### Supported code

Security fixes target the current production deployment and the latest `main` branch. Historical commits, unmerged branches, preview deployments, and old builds do not have a separate maintenance commitment. The production website may lag behind `main`; include both identifiers when available.

Maintainers assess reports, seek clarification when needed, and coordinate remediation and disclosure. No fixed response deadline or payment is promised.

#### Development safeguards

Keep secrets out of source control and browser bundles. `NEXT_PUBLIC_*` values are visible to visitors. Firebase web configuration identifies the project; authorization depends on Authentication and deployed Firestore rules. Run rules tests and deploy compatible rules before shipping dependent website changes. See [Architecture](#architecture-and-data) and [Deployment](#production-operations).


### Support

| Need | Where to go |
| --- | --- |
| Playing or using Vihar | [Help](https://vihar.online/help) |
| Account assistance, privacy requests, or a listing/review report | [Contact](https://vihar.online/contact) or [contact@vihar.online](mailto:contact@vihar.online) |
| Reproducible website bug | [Open a bug report](https://github.com/tirthankardgen-cell/Vihar/issues/new?template=bug_report.yml) |
| Product improvement | [Suggest a feature](https://github.com/tirthankardgen-cell/Vihar/issues/new?template=feature_request.yml) |
| Security vulnerability | Follow the private process in [SECURITY.md](#security-and-support) |
| Brand, asset, or code usage permission | [contact@vihar.online](mailto:contact@vihar.online) |

For technical issues, include the affected page, expected and actual behavior, browser/device details, and concise reproduction steps. Redact personal information from screenshots and logs. Public issues are not suitable for passwords, account recovery details, payment information, or private security reports.

Community games run on their creators’ hosting. For a game-specific issue, use its creator’s support channel when available. Report misleading or harmful Vihar listings through the contact page.

Support availability and response times vary; no service-level guarantee is implied.


### Community code of conduct

Vihar should be a welcoming place for players, creators, and contributors. Treat others with respect, make room for different experiences, and keep discussions focused on the work.

#### Expected behavior

- Give specific, constructive feedback about ideas and implementations.
- Respect personal boundaries, privacy, and intellectual property.
- Use clear, considerate language and accept corrections in good faith.
- Credit the people whose work you build upon.

#### Unacceptable behavior

Harassment, threats, discriminatory abuse, sexual harassment, doxxing, impersonation, spam, deliberate disruption, and publishing someone’s private information without permission are not acceptable. Do not manipulate reviews or use community spaces to target an individual.

#### Scope and reporting

This policy applies to repository issues, pull requests, and other Vihar-managed contribution spaces, as well as conduct while explicitly representing the project. Website use is also governed by the [Terms](https://vihar.online/terms).

Report conduct concerns privately to [contact@vihar.online](mailto:contact@vihar.online). Include relevant links and a short description, without spreading sensitive material. Security vulnerabilities belong under [SECURITY.md](#security-and-support).

Maintainers may edit or remove harmful content, ask participants to change their behavior, close disruptive discussions, or restrict participation. Responses should consider the impact, context, and whether behavior is repeated. Reports should be handled discreetly, with information shared only as needed to investigate and respond. Participants may request reconsideration through the same contact address.


## Change log

### 2026-11-08 — Investigate AdSense ads.txt Not found

- **Author:** Codex, 15:20 UTC.
- **Request:** Investigate the owner's AdSense screenshot for vihar.online and push the update to GitHub main.
- **Changes:** Added `npm run verify:ads-live`, a repeatable read-only production diagnostic for the root declaration, redirects, content type and crawler user agents; documented account-side follow-up here.
- **Decisions:** Preserved the working ads.txt route and approval/consent advertising gates. Live HTTPS already returned HTTP 200 and the exact authorized publisher declaration. No missing-file code defect was reproduced; the screenshot's Not found status is not evidence the current file is missing. Google's actual fetch history remains unknown.
- **Validation:** `npm run verify:ads-live` passed all six live checks; `npm run check:log`, Node syntax check, targeted ESLint and `git diff --check` passed. Production robots.txt permits ads.txt. No application/runtime code changed, so the full application build and Firebase suites were not rerun.
- **Release:** Prepared for the owner's authorized push to main. AdSense recrawl and site approval remain controlled by Google; no account settings changed.


### 2026-11-08 — README appearance across GitHub themes

- **Author:** Codex.
- **Request:** Finish the professional README presentation with readable branding in both light and dark viewing themes.
- **Changes:** Added a theme-aware picture element using the existing official inverse wordmark for dark mode and the original wordmark for light mode.
- **Decisions:** Reuse the official assets rather than recoloring the logo or adding a new generated image. This keeps the README concise and preserves brand proportions.
- **Validation:** Both referenced SVG assets exist in the tracked production brand directory. Reviewed the picture/source markup and checked the development-log gate and Git whitespace validation. Application code is unchanged from the verified `e6a26aa` release.
- **Release:** Documentation-only change on `main`; no environment, data or runtime migration.

### 2026-11-08 — Production verification and cleanup confirmation

- **Author:** Codex.
- **Request:** Complete the authorized production delivery and retain the verified outcome in the single development record.
- **Changes:** Recorded the completed deployment, CI results, live service checks and workspace cleanup. This follow-up changes documentation only.
- **Decisions:** Preserve the exact application commit and observation time so later agents can distinguish verified release evidence from plans. Temporary evidence was summarized here before removal; required source assets, tests, licenses, `.env.local`, `.vercel` and dependencies remain intact.
- **Validation:** GitHub Actions run `42483238941` passed all five checks for `e6a26aa7b513adb784f67a0fac11b92ce06f89b2`: Development log, Firebase authorization rules, and website checks in review/enabled/preview modes. Vercel deployment `dpl_Chhk1994abaoZrc4ARBRWHtREKDv` reached READY. At 13:09:31 UTC, the canonical production smoke passed 15 help guides, sitemap/robots, SDK delivery, private auth headers, Firestore token lookup and real Firebase identity verification; its ephemeral Auth account was removed. All seven local review ports were free. `output/`, `.next/`, `.playwright-cli/`, the local playground, duplicate guides and generated export folders were absent, and the working tree was clean after the application commit.
- **Release:** Application release `e6a26aa` is verified on https://vihar.online. This documentation-only confirmation introduces no application, database-rule or environment change.

### 2026-11-08 — Review completion, compact identity card and repository consolidation

- **Author:** Codex, following the owner's completed local review.
- **Request:** Finish the local review, remove temporary/unnecessary material, publish all accepted updates to `main`, improve the README and make one development record mandatory for every future agent.
- **Changes:** Replaced the consent account row with a compact graphite/gold Vihar ID card; tightened popup spacing and placed Cancel beside Allow. Stopped the review launcher and removed the disposable studio playground, generated exports and redundant guides. Rewrote README.md, consolidated current operations and historical evidence here, and added mandatory AGENTS/PR instructions plus a development-log CI check. Retained production SDK/help pages, original assets, automated tests and legal notices.
- **Decisions:** Kept the existing filename `development.md` as the single operational log. The smaller card reuses the established Vihar identity styling; normal interactive dashboard/profile cards stay unchanged. The screen is compact through layout, not by clipping permissions or buttons. Archived documents are retained in Git; current guidance is centralized so outdated credential, integration and test-status claims cannot masquerade as current instructions. Generated campaign images go to ignored output; reusable campaign input stays with source assets.
- **Validation:** Real Chromium measured the entire consent document at 1280×660, 540×760, 540×600, 390×660, 375×600 and 320×568. All six fit with no horizontal or vertical document overflow and the privacy links visible. Consent height was 562.5px at 540×760, 490.5px at 540×600 and 549px at 320×568. `npm run check` passed on Node 26.13.0: lint, 31 unit/protocol/SDK tests, TypeScript and the 47-page build. `npm run verify` passed for 29 public and 10 account routes, assets, metadata, links, headers and policy boundaries. The new log gate passed six positive/negative Git-fixture cases, including missing entries, incomplete fields, CRLF-only edits, a valid working change, a commit range and an initial push. All 15 moved campaign artwork references and 18 current local document links resolved; a full historical-link audit found no missing local targets. All seven review ports were successfully bound and released after shutdown, proving the review services were stopped. Disposable evidence was removed after these checks. Authorization/service contracts are unchanged and remain covered by CI.
- **Release:** Delivered as `e6a26aa` to the authorized `main` branch. Local review and artifact cleanup are complete. All GitHub checks and the Vercel deployment passed; the following production smoke is recorded in the verification entry above. No Firestore rules or data migration was required.

### 2026-11-08 — Community Vihar ID service, studio SDK and reviewed authentication flow

- **Author:** Codex, at the owner's request.
- **Request:** Let external studios use one Vihar player identity, track every integrated game's real sessions, centralize supported saves/activity, explain publishing and integration, and supply a temporary local test website.
- **Changes:** Added the public SDK, PKCE popup approval, scoped credentials, cloud saves/revisions, activity-only direct launches, dashboard/creator metrics and publication readiness rules. Added 15 indexed help articles, structured metadata, crawler/sitemap support and button/icon instructions. Replaced the generic popup website shell with in-window login, signup, recovery, profile setup and consent. Added official-icon light/dark/compact button variants and limited studio brand-use permission.
- **Decisions:** Games with accounts or saved progress require visible Vihar ID on the studio's own site; direct-play games need tracking but no login gate. Never transfer Firebase credentials to a studio. Saves and tokens are game-scoped; opens are distinct from active gameplay; hidden/paused intervals and owner tests do not inflate totals. The local studio harness used isolated emulators and synthetic accounts and was removed when review ended.
- **Validation:** The prior release passed 65 unit/protocol/SDK/rules/service tests, lint, TypeScript, build and the rendered HTTP verifier. Chromium exercised popup origin/state validation, sign-in/signup, profile creation, cancel/switch, save/load/conflict, 18–19 seconds of credited play excluding pause, sign-out, direct activity-only launch, private dashboard attribution and disconnect. Mobile widths down to 320px were inspected. Production smoke at 12:37 UTC verified 15 guides, sitemap, robots, SDK, private headers, Firestore access and real Firebase identity verification; its ephemeral account was removed. IndexNow accepted 29 canonical URLs earlier in the release.
- **Release:** `44e402d` implemented integration; `662eaad` documented the serverless ESM requirement; `43ba990` delivered the compact auth flow and temporary playground; `98e0358` fixed username input spacing. GitHub run 42480846253 passed for `98e0358892dc0eb8a4b1f341ceb36205ce959693`; Vercel deployment `dpl_4rbv23vpQSHFnggeGHUpg64uJr3m` was READY. Current deployment state must always be rechecked for newer commits.

## Historical record

The following dated material preserves earlier implementation decisions and test evidence. Earlier descriptions of unimplemented cross-domain identity, unavailable Firebase credentials, blocked emulator downloads, retained screenshots or required duplicate guides are superseded by the current sections above. Historical campaign copy and original briefs remain available in Git; they are not separate maintained project guides.

#### Public indexing, Bing verification and canonical domain — 2026-11-06 16:00 UTC

Author: Codex. Implements the owner’s final clarification: index public content, keep account/private/preview pages noindex, and use the non-www domain.

- Preserved account/dashboard/profile/card and hero-preview noindex directives, authentication, and Firestore rules. Unavailable community games now return a real 404 instead of a 200 error shell.
- Kept production robots permissive with the canonical sitemap; deployment previews remain blocked. Verified unique titles and descriptions across public and account routes.
- Added optional BING_SITE_VERIFICATION metadata (msvalidate.01). The owner is creating their Bing account; actual verification and sitemap submission remain pending their public token.
- Changed the canonical default and active documentation to https://vihar.online. Added a SITE_URL-gated 308 www redirect preserving paths and query strings. Live checks confirmed apex HTTP 200 and Vercel www HTTP 301 to apex; 301 is also a valid permanent redirect. Production SITE_URL and Firebase authorized domains remain account-side configuration.
- Clarified scorebadge.com is an external SEO/speed/security/AI-readiness audit service with an embeddable badge. Removed the provisional scroll-progress interpretation. No badge score, login or service verification was fabricated.
- Validation: `npm run check` passed (lint, 14 unit tests, type checking and production build); `npm run verify` passed for 12 public and 10 noindex account routes, canonical URLs, path/query-preserving 308 redirect, robots/sitemap, metadata, FAQ parity and original-logo favicon. Earlier local Bing-token and preview-mode verification passed; the unchanged Firestore emulator suite passed 21 tests.

#### Sitemap discovery hints and Gulam Chor audit — 2026-11-06 14:28:32 IST (UTC+05:30)

Author: Codex. Request: verify the newly added game, set maximum priority and daily hints, check favicon discovery, and push to GitHub. Synced with main at 64bcdbb before editing.

- Confirmed Gulam Chor already exists in the canonical sitemap and returns index/follow metadata. Kept all completed public pages and published community listings; excluded private account/dashboard routes as before.
- Added priority 1.0 and changeFrequency daily to both core and community URL entries. Google explicitly ignores these hints; assigning equal priority is not a ranking boost or crawl schedule. Preserved five-minute on-demand revalidation and authentic content/Firestore lastmod dates. No daily timestamp fabrication, cron cost or retired sitemap ping.
- Added Gulam Chor sharing artwork to its image sitemap entry. Existing screenshots, icons and gallery coverage remain. Kept the stable 192px original-logo favicon rather than changing its URL and restarting discovery.
- Live pre-change checks: canonical homepage, Gulam Chor page, robots.txt and favicon returned HTTP 200. Homepage/game were index/follow with matching canonicals; image response had no noindex/noimageindex header. This does not prove Google's actual index state or access from Google's infrastructure. The owner reported Search Console status “Discovered — currently not indexed”: Google knows the URL but has not crawled it yet. The displayed report date is not a monthly crawl instruction. URL Inspection remains necessary to track actual Google fetch/index status.
- Google reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap ; favicon guidance: https://developers.google.com/search/docs/appearance/favicon-in-search . After deployment submit https://vihar.online/sitemap.xml, inspect the homepage and Gulam Chor canonical URL, and request indexing once when eligible. Google controls inclusion and favicon appearance; no deadline is promised.
- Validation: included in the successful final checks recorded above.


#### AdSense email checklist audit and content refresh — 2026-11-02

Author: Codex, at the owner's request to check and maintain the content, transparency, navigation, performance and SEO points in Google's email.

Live HTTPS checks confirmed About, Contact, Help, Privacy, Terms, the first-drive article, game detail/gallery and the public site directory. The www site has unique page metadata and canonical URLs; the apex returns 308 to www. `robots.txt`, the image sitemap and `ads.txt` return 200 with the expected public publisher `pub-6693217545827146`. The game and its readable `/guide.html` also return 200. No ad loader appeared on the checked publisher pages; the upcoming page remains noindex and the missing-page check returned an ad-free/noindex 404. The contact email link is correct, but mailbox delivery was not tested and authenticated AdSense/Search Console status was not inspected.

The reviewed publisher pages contain game-specific writing, screenshots and original illustrations with gameplay/concept labels. No obvious adult, hateful or graphic violent material was found in those pages. This is a scoped review, not a certification of every user profile, media right, game interaction or Google's assessment of content value. There is one dedicated article and one playable game. Useful new content and policy reviews remain ongoing work; the operating checklist above records how to maintain them without fabricating activity.

The deployed game's published README was checked directly against the first-drive article. The article now covers the skippable opening, the current four-roundabout map, 29 authored landmarks and the readable game guide. Phone advice in the article, Help and game detail now reflects automatic landscape selection/driving even on an upright phone. The visible guide update date and Article `dateModified` share `2026-11-02`; the original publication date remains `2026-10-31`. Changes are in `src/app/guides/bap-ka-rasta-first-drive/page.tsx`, `src/app/help/page.tsx`, `src/app/games/bap-ka-rasta/page.tsx` and this record. These content changes were verified locally and have not been deployed by this audit.

Validation: `npm run check` passed on Node 26.13.0 (lint, all four AdSense and six account tests, type generation/type checking, production build). `npm run verify` passed for 12 public routes, nine ad-free/noindex account routes, metadata, links, asset budgets and the existing advertising gates. Live browser checks covered all 12 public routes at 390px and 1440px, mobile navigation/escape, search, Contact and the guide/site directory without JavaScript, with no page errors or horizontal overflow. Local checks verified the three changed pages at 320px, 390px and 1440px, the guide's date parity, current instructions and new source link. Updated guide/game screenshots were visually reviewed. A transient local 500 occurred while the shared build manifest was unavailable; after it was restored, all nine local page/width checks passed.

Fresh Lighthouse 13.6.0 measurements on the **live homepage**, with Chrome 156 and standard simulated mobile/desktop settings:

| Audit | Mobile | Desktop |
| --- | --- | --- |
| Performance | 81 | 95 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| Largest contentful paint | 1.6 s | 1.3 s |
| Total blocking time | 730 ms | 10 ms |
| Cumulative layout shift | 0 | 0 |

Mobile responsiveness remains an optimization target: the audit reports JavaScript execution and style/layout work during startup. These are lab results, not real-user Core Web Vitals or proof of AdSense eligibility. The existing animated homepage was retained; this audit does not claim a performance fix. HTTP results, source captures, browser scripts/screenshots and both HTML/JSON Lighthouse reports are in ignored `output/playwright/adsense-checklist-live/` and `output/playwright/adsense-checklist-*.js`.

Official Google pages were refreshed directly on 2 November 2026: [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en), [eligibility requirements](https://support.google.com/adsense/answer/9724?hl=en) and [screens without publisher content](https://support.google.com/publisherpolicies/answer/11112688?hl=en). Eligibility requires unique, high-quality content and policy compliance; it does not mandate a video, a specific number of articles or a fixed publishing frequency. Only Google can grant site approval. Leave serving disabled while approval and the documented account/consent/placement checks are pending.

The owner subsequently authorized committing and pushing these four audited files to GitHub on 2 November 2026. Publication uses the existing `main` branch and GitHub/Vercel connection; a successful GitHub push is separate from confirmation that the production deployment has finished.

#### Into the Vihar World hero and preview — 2026-11-01

Author: Codex, at the owner's request to adapt the supplied perspective tunnel and then make its many images pass over the text. The homepage now opens with **Into the Vihar world.** Nine cards follow the reference's golden-angle spiral, staggered depth, rotation and fade. The heading sits behind the images; the catalogue/play actions remain above them. The indigo atmosphere, bold uppercase lettering and local game artwork make the introduction a journey into Vihar's games.

The same hero remains testable at `/preview/vihar-world`, with noindex/nofollow metadata and no sitemap entry. The remaining homepage sections are shared without content changes through `src/components/home-content.tsx`. The old courtyard hero markup, image preloads and unused hero CSS are removed from the homepage.

The reusable component and scoped stylesheet are in `src/components/ui/perspective-tunnel-hero.tsx` and `perspective-tunnel-hero.module.css`. The existing component alias, TypeScript, Tailwind and `motion/react` support the integration without a second Framer Motion dependency. Nine optimized local images cover concept art, actual gameplay, world/vehicle renders, illustrations and the playable map, with accurate captions and links. All nine appear on phones as well as desktops.

Native scrolling advances the corridor and continues into the games. Pointer movement adds desktop parallax; touch, keyboard and section links retain normal navigation. Short windows and enlarged text use natural page scrolling. Pause/resume, live reduced-motion preferences, visible keyboard focus and a usable catalogue link without JavaScript are preserved. The copy wrapper does not create a stacking context, so images can overlap the animated heading while the actions stay clickable.

Next.js 16.4.3's bundled guides were consulted. The graph CSS strategy separates route styles from the shared shell. HTTP verification now checks the nine-card homepage and noindex preview, locally sourced responsive images, negotiated AVIF/WebP formats, cache headers and source proportions. The former 25 KiB single-image budget is replaced by a **128 KiB aggregate budget for nine mobile card images**. The animated hero adds its scoped stylesheet; homepage CSS measures **41,228 bytes** against an updated **42 KiB uncompressed limit**, with obsolete hero rules removed.

Validation on Node.js 22.23.4: `npm run check` passed, including lint, ten existing AdSense/account tests, type checking and the production build. Final build and `npm run verify` passed. Browser checks covered 1440×900, 1280×632, 768×500, 844×390, 390×844 and 320×740: nine cards at distinct depths in front of the heading, no horizontal overflow or nested scrolling, and reachable actions. Native scrolling, parallax, pause/resume, the Featured jump, all 35 desktop/phone keyboard focus steps, live reduced-motion changes, forced colours, 150% text at three widths and navigation with JavaScript disabled passed. Axe reported no WCAG A/AA violations at desktop/phone widths and there were no uncaught browser errors. Screenshots were visually reviewed, including the phone heading line breaks. Scripts, JSON results and images are in ignored `output/playwright/vihar-hero-*` and `vihar-world-*` files; these are local production-build checks.

The owner explicitly requested a GitHub push for production after the revision. Production publication uses the repository's existing GitHub/Vercel connection. The local production-mode preview is `http://localhost:3000/preview/vihar-world`; the owned process record is in `output/playwright/hero-preview-process.json`. If stopped, use the Node.js version in `.nvmrc` to build, then run `npm run start -- --hostname 127.0.0.1 --port 3000`.

#### Share the portrait ID as a photo — 2026-11-01

Author: Codex, at the owner's request after reviewing the WhatsApp screenshots. Replaced the wide social banner with the standalone 900 × 1200 portrait card, declared its actual dimensions in Open Graph metadata, and versioned its image URL. Added a native sharing dialog with the full card, photo sharing, download and copy-link actions. File sharing starts directly on a user tap after preparation; cancel, download-only browsers, clipboard failure, retry and modal cleanup are handled. Native sharing hands the image to the selected app without automatically sending a message. Public profile reads, account permissions and game stats are unchanged.

The dialog styles load with the existing player theme. Tailwind source discovery is explicitly rooted at `src/`, keeping temporary verification files and surrounding workspaces out of generated utility CSS.

Validation: lint, all 10 existing tests, type checking, the final production build and `npm run verify` passed, including the homepage CSS budget. The sharing dialog passed layout and axe checks at 1440 × 900, 390 × 844, 320 × 740 and 844 × 390, with no horizontal overflow or page errors. A controlled Web Share stub confirmed a real 900 × 1200 PNG file, its filename, the profile link and active user activation at handoff; no message was sent to an external app. Cancellation, sharing failure, unsupported file sharing, download, clipboard success/fallback, retry, Escape, focus restoration and object URL cleanup passed. Read-only checks of the real `mrtg1b` profile confirmed portrait dimensions and PNG metadata in the head for WhatsApp, Twitterbot and Facebook crawlers. The legacy preview URL also returns the portrait, and the download response uses an attachment disposition.

#### Dark player screens, activity calendar, onboarding and personal cards — 2026-11-01

Author: Codex, at the owner's request. Added a charcoal/off-white player theme with restrained amber accents and sans-serif headings across the dashboard, game library, friends, settings, public profiles and their loading/error states. The surrounding header/footer follows the player theme. Server-rendered route markers and dark viewport metadata keep the style scoped through client navigation; the public catalogue and login retain their existing appearance. Theme styles are in `src/app/player-theme.css` and the dashboard/profile layouts.

Integrated the supplied activity heatmap under `src/components/ui/`, added its missing CSS/motion utilities and the `motion` dependency, and connected a new `PlayActivity` section to optional daily game records. It supports 90-day/year ranges, pointer/keyboard date selection, moving tooltips, a pinned level legend, reduced motion and horizontal browsing on phones. The visible scroll container triggers the entrance animation so a year-wide chart is not left invisible on narrow screens. Calendar aggregation has focused tests for multiple games, leap days, legacy stats and malformed data. Random demo activity is not shipped or written to production.

Rebuilt onboarding as two steps (identity, then avatar) within the available viewport. A live card on the left updates with the player's name, username and avatar; phones use a compact preview above the current step. Back retains the entered data, username claims remain atomic, and successful creation restores normal dashboard scrolling. Small landscape windows retain keyboard/touch access through the form without an outer scrollbar. The dedicated stylesheet is imported after the common account/theme styles to preserve production CSS order.

Added individual vertical card downloads and server-generated social preview images, using only public profile fields and the existing avatar catalogue. Profile metadata now identifies the player and supplies their card to sharing crawlers. The route's bundled assets are listed in `next.config.ts`. Existing Firebase rules and separate game deployments are unchanged.

Validation: the isolated release passed `npm run check` (lint, 10 tests, type checking and production build), followed by a production build with emulators disabled and `npm run verify` (11 public routes and nine account routes, assets, metadata, links and hosting policies). Dashboard/profile browser checks passed at desktop, phone and short landscape sizes across 20 cases, with no horizontal overflow, page errors or reported axe violations. Both onboarding steps passed 12 viewport cases; live preview, reserved usernames, Back retention and successful profile creation were verified. Creation restores the footer and normal dashboard scrolling, with an empty activity history for a new account. Heatmap checks covered actual daily totals, keyboard navigation, range changes, pinned legend dismissal and reduced motion. Read-only checks of the real `mrtg1b` profile confirmed the 900 × 1200 card, 1200 × 630 preview and personalized image metadata in the head for WhatsApp, Twitterbot and Facebook crawlers. The deployment trace includes all six avatars and the emblem. `npm audit --omit=dev` reported zero vulnerabilities.

#### Fit the login page into one viewport — 2026-11-01

Author: Codex, at the owner's request. `/login` now fills the space below the header in one viewport, with its site footer and visible scrollbars removed. The two-column composition, heading, spacing and player card adapt to the available height. Normal laptop/phone sizes display the complete sign-in form without scrolling. Very short landscape windows retain wheel, touch and keyboard access inside the form without an outer page scrollbar; a failed-login message is brought into view automatically. The page marker scopes these styles even when Next retains CSS during client navigation, so other pages restore their normal footer and scrolling. Changes are limited to the login wrapper/styles, the login heading/error presentation in the shared form, and this record.

Validation: `npm run check` and `npm run verify` passed on Node 22, including the production build and all 20 public/account routes. Production browser checks covered 1920×1080, 1440×900, 1280×632, 1280×599, 768×600, 390×844, 320×740 and 844×390. All had no outer page overflow or visible footer/scrollbar; the seven taller cases showed every sign-in control without form scrolling, and the short landscape case retained keyboard access to the bottom of the form. Mobile menu navigation, browser Back, signup layout restoration, password visibility and a mocked failed-login response passed. Axe found no main-content violations at desktop and phone sizes. Screenshots and scripts are in ignored `output/playwright/login-viewport-*`.

#### Vihar ID accounts, profiles and friends — 2026-11-01

Author: Codex, at the owner's request. Added an optional Firebase account layer with Google/email sign-in, unique atomic username claims, six selectable avatars, public shareable profiles, private saved games, mutual friend requests, dashboard statistics, profile settings, email verification, password recovery, provider linking and data export. The owner requested a more mature gaming identity during review; the final assets are the six geometric gamer portraits documented above, with graphite player cards and more direct account copy. Public pages retain the existing Vihar design. Independent game repositories were not changed, and game statistics remain explicitly pending their future integration.

Added the account routes/components, lazy Firebase client, typed data access, restrictive Firestore/Storage rules, emulator tests, Java 21 rules CI, public environment template, updated privacy/terms/FAQ, header/footer/home account links, and HTTP checks for all new routes and assets. Private service-account credentials are not required for this release and are not committed. Firebase configuration is supplied through ignored local settings and Vercel build variables; Analytics remains off. Security rules keep email out of public profiles, isolate favorites and friend relationships, make usernames immutable and deny all client score writes. The auth state preserves forms on token refresh and clears account state when the UID changes.

Validation on Node 22: `npm run check` passed strict lint, eight configuration/model tests, type checking and the production build. `npm run test:rules` passed all 14 authorization tests using Firestore Emulator and Java 21, including simultaneous username claims and reciprocal friendship writes. `npm run verify` passed all 11 existing public routes, nine noindex/ad-free account/profile routes, six avatar assets, existing metadata/link/image checks and homepage budgets. `npm audit --omit=dev` reported zero vulnerabilities. Existing AVIF passthrough and Node test-module notices remain non-failing.

Real-browser QA used isolated Firebase emulators and synthetic accounts. Passing flows include Google popup sign-in, email registration, reserved/taken usernames, profile/avatar edits, reload persistence, private favorites, public sharing and email privacy, email verification on a fresh full-page load, friend send/accept/cancel/decline/remove, password creation on a Google account with the same UID, password reset, account export without tokens, and sign-out/account isolation. Final accessibility/responsive checks passed 37 page/viewport cases across 1440×900, 390×844, 320×740 and 844×390, with no horizontal overflow and no axe violations in main content. Login, onboarding, dashboard and phone profiles were visually reviewed. Evidence is in ignored `output/playwright/vihar-id-*`; test accounts were confined to `demo-vihar`.

The owner confirmed Google/email providers, production authorized domains and Firestore rule publication. Live read-only probes confirmed the domains and expected public/private Firestore access behavior. The authorized GitHub push deployed application commit `6f655c8` successfully through Vercel. Live browser checks on `www.vihar.online` confirmed the configured Firebase email endpoint returns the expected generic error for a nonexistent synthetic login, Google opens `accounts.google.com`, a missing public profile resolves correctly through Firestore, and the redesigned avatar asset is served. Login/signup screens load and the Vercel Firebase variables are active. No production test accounts or profiles were created. These are production configuration/smoke checks; completed account and friendship flows were exercised in isolated emulators.

The first GitHub run exposed a timing assumption in the adversarial reciprocal-write test: Firestore may reject both concurrent raw writes when their rule reads conflict. The test now verifies at most one successful write, no records from rejected writes, a successful retry when both abort, and rejection of a reverse duplicate after a connection exists. The deployed rules and application behavior are unchanged. The added Java setup action uses v5 following the runner's v4 deprecation notice.

#### Remove section scrollbars and visible breadcrumbs — 2026-11-01

Author: Codex, at the owner's request to fix the clipped Bap Ka Rasta hero, remove the Home / Games / current-page breadcrumb row everywhere, keep desktop sections sized to one screen without internal scrollbars, and push the changes to GitHub. Base commit: 84582f6.

Desktop sections and page introductions now use the available screen height as a minimum. Their content participates in document flow, so narrow windows, enlarged text and expanded FAQ answers stay readable without nested vertical scrolling. This supersedes the earlier fixed-height / internal-scroll behavior; normal desktop panels still fill a screen. The homepage hero and featured copy no longer create their own scroll containers.

The game hero uses the full height below the header, with compact spacing for short desktop windows and a natural artwork/copy stack on phones. Its status badge, launch action and footnote stay inside the hero, and the artwork is positioned to retain the foreground vehicles. Visible breadcrumbs and their reserved height/styles are removed from every route. Inner-page CSS still loads through PageIntro or explicit route imports, preserving the homepage CSS budget. Section jumps rely on the shared header scroll padding without adding a second header offset. The Controls jump targets the whole panel so its numbered heading remains visible. Main navigation, gallery filters, the image viewer and structured-data breadcrumbs remain available.

Validation on Node 22.23.4: `npm run check` and `npm run verify` passed, including strict lint, all four existing configuration tests, TypeScript, the production build, all 11 public routes and the existing homepage asset/CSS budgets. Production browser checks passed 55 page/viewport combinations at 1440×900, 1280×599, 768×500, 390×844 and 320×740: no visible breadcrumbs, nested vertical scrolling, horizontally overflowing pages or clipped text. Desktop panels fit the available screen at 1440×900 and 1280×599; small windows and expanded content retain natural page scrolling. The hero stayed unclipped at 150% text size in four desktop/phone sizes, and opening every Help answer created no nested scroller. All five game section jumps and the home feature/FAQ and guide contents links aligned below the header. The six vehicle previews, gallery filters, viewer keyboard/Escape/focus restoration, Back-to-game navigation, reduced motion and forced colours passed; Axe reported no violations in the game page, gallery or open viewer at the checked desktop/phone sizes. Final screenshots were visually reviewed. Scripts, JSON results and previews are in ignored `output/playwright/bkr-scroll-*` and `bkr-final-*`. These are local production checks; the owner authorized the GitHub push.

#### Bap Ka Rasta visual game page and gallery — 2026-11-01

Replaced the long game-detail story and build-note sections with a large illustrated game banner, an interactive six-ride garage, a five-city image grid, four actual character-model portraits, a three-image gameplay collage, and a compact controls/device panel. The page uses bold DM Sans headings, charcoal and warm yellow alongside the existing Vihar canvas and navigation. Desktop panels retain the one-screen layout; phone panels have natural heights. The first-drive guide remains the destination for detailed instructions.

The gallery now contains 27 images: three gameplay captures, the playable road map, five city concepts, four world/landmark renders, six vehicle concepts, and eight actual character-model portraits. Category filters and a native-dialog image viewer support keyboard navigation, previous/next, Escape, focus restoration, and full-size links. Images remain accessible as ordinary links without JavaScript. ImageGallery data and the image sitemap include every gallery image; VideoGame screenshots remain the actual gameplay captures/map. The game itself is never embedded or preloaded.

Playable availability was checked against the current `Game 1/src/selection/Selection.tsx` and `Game 1/docs/Mumbai-Playable.md`: Mumbai and the auto are playable; Delhi, Kolkata, Chennai, Bangalore, Thar, Fortuner, Scooty, KTM and Toto remain previews. The gallery and detail cards label these accurately. Character names and artwork match the game's cast and model renders.

New source copies from the owner's `D:\Personal Project\Game 1` checkout are preserved under `assets/original/`: `public/images/vehicle-gallery.webp` → `bap-ka-rasta-vehicle-gallery.webp`; `public/images/world-board.webp` → `bap-ka-rasta-world-board.webp`; `public/images/toto-erickshaw.png` → `bap-ka-rasta-toto.png`; `docs/mumbai-characters/renders/main-cast.jpg` → `bap-ka-rasta-main-cast.jpg`; `docs/mumbai-landmarks/landmark-library.jpg` → `bap-ka-rasta-landmarks.jpg`; `docs/mumbai-landmarks/street-scale.jpg` → `bap-ka-rasta-street-scale.jpg`. Existing gameplay originals are retained. `scripts/generate-game-showcase.mjs` crops these sources into 23 WebP images totalling approximately 462 KiB; `npm run assets` includes this step. Runtime assets are self-contained in this repository, without a dependency on the separate game checkout. The game checkout was not modified.

Validation on Node 22.23.4: `npm run check` and `npm run verify` passed, including strict lint, four existing configuration tests, TypeScript, production build, all 11 public pages, the 27-image gallery/schema/sitemap, internal links, and existing homepage image/CSS budgets. Production layout checks covered 1440×900, 1280×632, 768×500, 390×844 and 320×740: no horizontal overflow, overlapping panels or broken visible images; normal desktop panels fit their allocated screen, and short windows retain scroll access. All six vehicle previews, keyboard selection, future-vehicle launch restrictions, all five gallery filters, viewer arrow keys/previous/Escape/focus restoration, Back-to-game navigation, reduced motion and forced colours passed. Axe found no violations in either updated page at desktop/phone widths or in the open viewer. The browser requested no game-origin assets and reported no uncaught errors. Desktop/phone screenshots were visually reviewed; scripts and screenshots are in ignored `output/playwright/bkr-*`. The owner authorized a GitHub push after the updates; these checks are local production checks, not a claim of completed hosting deployment.

#### Image cards and category browsing — 2026-11-01

The home collection and Games page now share full-image cards, with a title, short description, two quiet category labels, and one link covering the entire card. Availability and concept-art labels remain visible. The original artwork, warm canvas, serif typography and restrained hover effects are retained. Cards stack on phones; the category row scrolls horizontally. The home collection fits the usual desktop panel sizes, with scroll access retained in short windows.

Added a shared category registry in `src/lib/game-categories.ts`: Arcade, Free roam, Teamwork, Simulation and Solo. Homepage links and the Bap Ka Rasta detail links open the matching filtered collection. Games receive typed category IDs in `src/lib/games.ts`; the first two appear on their cards. Bap Ka Rasta is tagged for free roam, solo, arcade and simulation. Gulam Chor remains an upcoming announcement without invented gameplay or player-mode categories. Empty categories have a simple, honest empty state.

The Games page has a compact introduction, category selection, search, an availability filter, and Featured / Name A–Z / Name Z–A / Playable first sorting. Search matches words across titles, genres, descriptions, platforms and category labels. Result counts, clear-search and reset controls keep recovery straightforward. Validated URL parameters retain filters on reload and shared links; category/filter/sort changes support Back and Forward. A Suspense fallback preserves the complete static card list and usable game links before JavaScript loads. Only the first visible catalogue card loads eagerly; the homepage preview remains lazy.

Validation with Node 22.23.4: `npm run check` and `npm run verify` passed, including all 11 public routes and the existing metadata, asset and homepage CSS budgets. Production browser checks passed 16 search/filter/sort/history cases, including fast typing and the literal search term `all`, plus 13 keyboard, navigation, reduced-motion, forced-colors and JavaScript-disabled checks. Both updated pages passed layout checks at 1440×900, 1280×632, 768×500, 844×390, 390×844 and 320×740, with no horizontal overflow or clipped card text. Axe found no violations in the main content of Home, Games and Bap Ka Rasta at desktop and phone widths. Desktop and phone screenshots were visually reviewed. Browser scripts, results and previews are in ignored `output/playwright/catalogue-*` and `output/playwright/collection-*` files. These checks were run locally. The owner authorized committing and pushing this change to GitHub on 1 November 2026; deployment verification remains separate. The existing AVIF passthrough build notices remain.

#### Fit desktop sections, reset page navigation and improve image discovery — 2026-10-31

The owner corrected the coming-soon game name to **Gulam Chor**. The catalogue, page, FAQ, supporting copy and sharing image use that name, with canonical path `/games/gulam-chor`. The previous page and image URLs permanently redirect to their renamed destinations. Its development status and noindex policy are unchanged.

The owner asked for one-screen sections and hero introductions, with taller sections allowed on phones, and reported Search Console's “Discovered – currently not indexed” status. Desktop panels now use the viewport space below the sticky header, with compact artwork and spacing. Short windows and enlarged text retain scroll access to overflowing content. Phone layouts keep natural heights. Page changes start at the introduction and focus main content; same-page contents/FAQ links retain fragment navigation. Cross-page links omit fragments, including links across the guide's full-document advertising boundary.

Added `/games/bap-ka-rasta/screenshots`: four visible, captioned images with descriptive alt text, full-size links, ImageGallery/ImageObject data, links from the game page and guide, and entries in the Next.js image sitemap. VideoGame data also references the screenshots. Source captures are copied unchanged from the owner's game checkout: `output/playwright/mumbai-voices-driving.png` → `assets/original/bap-ka-rasta-seafront.png`; `output/playwright/mumbai-dialogue-1280x800.png` → `assets/original/bap-ka-rasta-conversation.png`; `docs/maps/mumbai-game-map.png` → `assets/original/bap-ka-rasta-mumbai-map.png`. The existing driver-camera capture is reused. WebP copies are reproducible with `npm run assets`; the fictional road-network map is explicitly distinguished from real Mumbai navigation.

Live inspection found no robots/noindex/canonical block on the main website: apex redirects to www and completed pages have crawlable HTML. The separate game still identified its old Vercel domain and returned an empty application root. The paired Game 1 changes correct its canonical, social, structured-data and sitemap references to `https://rasta.vihar.online`, and prerender the existing landing component during the Vite build for browser hydration. Gameplay remains client-rendered. These fixes improve crawlability and consistency; they do not establish why Google deferred the main site's crawl.

After both projects are published, verify the live HTML and image sitemaps, submit `https://vihar.online/sitemap.xml` and `https://rasta.vihar.online/sitemap.xml` in the relevant Search Console property, and use URL Inspection → Test live URL → Request indexing for the homepage, game page, gallery and game origin. Do not repeatedly request the same URL. Google documents that crawling can take days to weeks and submission does not guarantee inclusion. “Discovered” means Google knows the URL but has not crawled it; code cannot force indexing. The Search Console account actions and an actual indexed result remain external work.

References: [Google crawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [image guidance](https://developers.google.com/search/docs/appearance/google-images), [image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Validation: strict lint, all four advertising-configuration tests, TypeScript, production build and the extended HTTP verifier passed. The verifier covers all 11 public pages, visible gallery image markup, structured data, decoded sitemap images, renamed-page/image 308 redirects and absence of the old game name. Browser checks covered 55 page/viewport combinations (1280×632, 1440×900, 768×500, 390×844 and 320×740): no horizontal overflow, broken completed images or clipped starts; every desktop main panel matches its viewport allocation, and the normal desktop sizes need no internal overflow. Short desktop windows keep overflow scrollable, and phone sections keep natural height. Navigation checks passed for footer links, Back, same-page FAQ/contents anchors, cross-page control links, both directions across the guide document boundary, Gulam Chor search/navigation and the phone menu, with no uncaught page errors. Final screenshots and browser result files are in ignored `output/playwright/`.

The paired game work passed its build, all 81 unit tests and all 25 existing/new Playwright browser tests in Chrome. Initial HTML and JavaScript-disabled checks expose its heading and image; hydration still opens city selection. Its social artwork now displays the production domain. The code is verified locally; deployment and Search Console actions are not yet completed. Existing framework notices remain: Next passes pre-encoded AVIF imports through unchanged, and Vite reports the already-separated gameplay chunk above its default size warning.

Final local Lighthouse 13.6.0 mobile check: Performance 94; Accessibility, Best Practices, SEO and Agentic Browsing 100. FCP 0.9 s, LCP 3.2 s, TBT 40 ms, CLS 0, Speed Index 0.9 s. This is a single local simulated run, not the deployed site's score; LCP remains above 2.5 s in that simulation. Report: `output/playwright/layout-final-lighthouse.report.{json,html}`.

#### Reduce homepage first-load work — 2026-10-31

Author: Codex, following the owner's mobile Lighthouse report (94 Performance, other scored categories 100). Base commit: edae875. Changes are local; this task did not push or deploy the site.

Changes:

- Split the stylesheet into shared `globals.css`, homepage `home.css`, and inner-page `content.css`. The latter loads through Breadcrumbs / PageIntro, which every current inner page uses. All 518 original selector/declaration/media-condition combinations were preserved. Initial homepage CSS is 25,658 bytes uncompressed, down from 40,860 bytes. New inner-page components must keep the content stylesheet dependency.
- Prebuild the courtyard at 480, 768 and 1100 pixels in AVIF and WebP through `npm run assets`. The native picture element selects the appropriate source, retains fixed dimensions and alternative text, and uses a matching AVIF preload with high priority. Static imports give these assets hashed, immutable URLs. Mobile AVIF is 18,631 bytes, down from the previous optimized image's 25,750 bytes, and needs no request-time image conversion. Other images still use Next Image. The original artwork and source assets remain available.
- Preload the local Newsreader faces to remove their stylesheet-discovery delay. Keep font-display swap. Disable speculative Next Link prefetching so other routes and catalogue code load on navigation. Client routing and the guide's full-document advertising boundaries are preserved.
- Extend the HTTP verifier to decode all six hero variants, check actual dimensions, MIME types and immutable caching, and guard a 25 KiB mobile AVIF budget and 32 KiB uncompressed homepage CSS budget.

Validation: strict ESLint, the four AdSense configuration tests, TypeScript and production build passed. The production HTTP verifier passed all ten public routes and the new asset/CSS budgets. Browser checks passed at 320, 390, 844 landscape and 1440 pixels: keyboard skip link, mobile menu/Escape focus, client navigation, filters/search/reset, guide entry/exit document boundaries, FAQs, image decoding, overflow, reduced motion and absence of advertising requests/uncaught errors. Homepage text and layout above the artwork were pixel-identical to the baseline; desktop and mobile artwork were visually reviewed. All current CSS declarations and responsive conditions were compared to HEAD programmatically. Reports and screenshots are in ignored `output/playwright/`.

Measured with Lighthouse 13.6.0, Chrome 156, production localhost, default simulated mobile Slow 4G and 4x CPU slowdown. The local pre-change baseline scored 89. Three final runs scored **92, 93, 92**; Accessibility, Best Practices, SEO and Agentic Browsing were **100** in each. Median final FCP was about 0.9 s, LCP 3.2 s, TBT 80 ms, CLS 0 and Speed Index 0.9 s. The single baseline was FCP 0.9 s, LCP 3.4 s, TBT 180 ms, CLS 0 and Speed Index 0.9 s. The render-blocking estimate fell from 168 ms to 40–110 ms across the final runs; total transferred resources fell by approximately 29 KB in the representative comparison. These local scores are not directly comparable to the owner's hosted 94 or a guarantee of a deployed score. The retained final reports are `performance-cacheable-css-v13.report.{json,html}` and the corresponding `-2` and `-3` files; baseline is `performance-before-v13.report.{json,html}`.

Limits: LCP remains above 2.5 s in this local simulation. Next.js/React's shared runtime still triggers legacy-JavaScript (14 KiB estimated) and unused-JavaScript diagnostics. The unused estimate varies with coverage and can increase when speculative work is removed even though less JavaScript is downloaded; no framework code or browser compatibility guards were stripped to hide the audit. Full CSS inlining was tested and removed after it duplicated styles in HTML/RSC payloads without a reliable score gain. The cacheable split stylesheets retain a small blocking request. Turbopack emits three warnings that imported AVIFs are passed through without optimization/encoding; this is intentional for pre-encoded assets, and their emitted responses, caching and decoding were verified. Deployment and a fresh hosted Lighthouse audit remain necessary to measure the production outcome.

#### Address AdSense policy risks and prepare a reviewable site — 2026-10-31

Author: Codex, at the owner's request to investigate the rejection, consult Google policies online, fix the site and push to GitHub. Base commit: 701c3c6. See the policy findings and account steps above; Google did not disclose a specific rejection reason.

Changes: replaced the all-page loader with review-mode defaults and independent approval/consent/serving gates; preserved publisher verification and ads.txt. Restricted future loading to a completed, source-linked first-drive guide. Added full-document link boundaries for advertising pages and recovery from a hydrated page error. Corrected cookie/vendor disclosures and added a Google consent-reopening control for enabled mode. Added the guide to normal navigation and the sitemap; excluded the unfinished announcement from indexing while keeping it accessible. No game engine, new dependencies, publisher ID, domain, or Git history was changed. Automated CI now covers review, enabled and preview builds.

Validation on Windows with Node 22.23.4: strict ESLint passed; all four configuration/policy tests passed, including legacy enabled-only configuration, each missing readiness flag, preview override, malformed publisher values and excluded routes. TypeScript and production builds passed. The HTTP verifier passed all ten pages, internal links and assets, sitemap/indexing, metadata, publisher declaration, guide content, privacy wording, exact script placement/count, query URLs and three missing-page cases in review, enabled and preview modes. Restored and verified the default review-mode build last. Node emits a harmless module-type inference warning for the source TypeScript test imports; no test fails.

Browser validation: visually checked the guide on desktop and phone; no horizontal overflow or broken loaded images at 320, 390 and 1440 px. Review mode requested no Google advertising. Enabled mode used a mocked Google script only: verified the single loader, consent-reopening callback, complete removal of the mock ad/script across document navigation, search empty state, back/forward, mobile Help navigation, legal/upcoming pages and nested 404s, with no uncaught page errors. With the Google request blocked, the guide remained readable and the game launch link remained usable. Expected HTTP 404 console entries were produced by missing-page tests. Screenshots and local browser audit scripts remain in ignored output/playwright/. The separate live game was opened through its actual selection/start screens to 3D gameplay, confirming the guide's launch flow and displayed gear limits; this was not a physical-phone performance audit.

Remaining external steps: production deployment/readback after the authorized push, an AdSense re-review, and actual account approval plus certified consent/placement verification before enabling ads. Neither the code tests nor the new guide guarantee approval. The authenticated review request and account settings were not changed.

#### Install the supplied AdSense Auto ads head snippet — 2026-10-31 10:37:41 IST (UTC+05:30)

Author: Codex. The owner supplied Google's async script and requested placing it between head tags across the site. Enabled the loader by default and moved it from a deferred Next Script in the body to a native async script in the shared root head. Publisher ID and crossorigin=anonymous match the provided snippet. Previews still omit the script; ADSENSE_ENABLED=false remains an explicit off switch. Privacy disclosures already adapt to enabled mode. Updated configuration examples and verification to require exactly one matching async head script on each of the nine public routes, plus absence in preview/disabled mode. No Google account configuration or approval status is changed by this code.

Validation: npm run check passed (lint, TypeScript and production build). Production HTTP verification passed in default enabled mode, VERCEL_ENV=preview, and ADSENSE_ENABLED=false; each build was tested with matching environment values. Restored and verified the default enabled production build last. Checks cover one async head script on all nine pages, publisher/crossorigin attributes, preview/off suppression, matching privacy text, ads.txt and the existing site checks. git diff --check passed. Push to main continues the owner's authorized GitHub delivery workflow. Live ad delivery and AdSense approval remain Google-controlled and were not verified.


#### Make FAQs visible on the homepage — 2026-10-31 03:23:01 IST (UTC+05:30)

Author: Codex. The owner could not find the FAQs and requested a correction and GitHub push. Previously the new answers were only on /help.

- Added a clearly titled Frequently asked questions section at /#faqs, before the closing homepage action, with a responsive two-column desktop / one-column mobile layout. The first answer is open on initial load; every answer uses native keyboard-accessible details/summary controls and works without JavaScript.
- Added FAQs links in desktop navigation, mobile navigation and the footer. The homepage section links to all Help questions and troubleshooting. Both pages use the same factual answer source.
- Kept FAQPage structured data on /help only to avoid repeating the same marked-up FAQ across pages. Removed a redundant homepage WebSite entity; the stable identified WebSite entity remains.
- Extended production verification to require the homepage FAQ anchor, heading, navigation link, initially open answer and all shared question/answer text.
- Validation: npm run check and npm run verify passed under Node.js 22, including the new homepage FAQ assertions; git diff --check passed. Push is explicitly authorized; deployment success remains separate from the push.


#### Logo fidelity, discovery and AdSense review — 2026-10-31 03:12:32 IST (UTC+05:30)

Author: Codex, at the owner's request. Base GitHub commit: 4e893e0784e03211886e45f88dd25780a36bc174.

- Replaced the redrawn favicon with a square crop of the actual emblem in root logo.png: left 584, top 160, width/height 368. Preserve pixels, dot, shape and aspect ratio; exclude presentation text and sample icons. Regenerate ICO, PNG, Apple and manifest icons through npm run assets. Removed the competing public/icon.svg so browsers cannot prefer the old shape. Other header/vector branding is unchanged.
- Improved the homepage search title/description with truthful browser-game and Mumbai auto-rickshaw terms. Added a WebSite entity and visible discovery FAQs with matching FAQPage structured data. Existing canonicals, per-page metadata, sitemap and production/preview robots policy remain authoritative.
- Added optional Search Console verification, factual /llms.txt, validated AdSense config, account verification metadata, /ads.txt and a separately gated script. Updated privacy disclosures for review-only and enabled modes. Game content never depends on advertising availability.
- Consolidated deployment, verification and asset documentation into this file. Removed duplicate documents after preserving their content below, and shortened README. Retained the owner brief, original source artwork, font licences, lockfile and all runtime assets because they are needed for provenance or reproducibility.
- Tests: passed; see the dated validation entry below.
- No GitHub push, Vercel deployment, domain changes or account-setting changes are part of this local edit.

#### GitHub publication authorized — 2026-10-31 03:16:45 IST (UTC+05:30)

Author: Codex. The owner explicitly requested committing and pushing all prepared changes to GitHub. Their AdSense screenshot shows vihar.online as Getting ready and ads.txt as Not found. The /ads.txt route supplies `google.com, pub-6693217545827146, DIRECT, f08c47fec0942fa0` in production. Keep ad serving disabled while review is pending. Fetch confirmed origin/main still matches base 4e893e0, with no remote changes to merge. Push this change to main for the connected Vercel build; a Git push alone does not establish deployment success or AdSense approval. After deployment, verify https://www.vihar.online/ads.txt and allow Google to recrawl it. This supersedes the earlier local-only delivery status, not its validation evidence.

### Current validation — 2026-10-31 03:15:24 IST (UTC+05:30)

Author: Codex. Executed on Linux with Node.js 22.23.4 using the existing lockfile.

- npm ci completed; npm reported upstream ESLint peer-range warnings, but installation and strict lint succeeded. No dependency versions or lockfile were changed.
- npm run assets completed. Visually inspected the original logo and generated 192px icon. The automated 48px icon comparison proves pixels match a proportional resize of the source crop. Unrelated platform-dependent re-encodes of social artwork were discarded.
- npm run check passed (zero-warning lint, route type generation, TypeScript, production build).
- npm run verify passed: nine public pages, unique metadata, normalized canonical links, JSON-LD, local links, committed images/fonts/icons, sitemap, robots, manifest, launch/contact links, headers, 404, matching visible FAQs, original-logo icon, ads.txt and llms.txt.
- Built and verified ADSENSE_ENABLED=true: standard loader is present, publisher metadata/declaration match the owner's ID, and privacy text reflects enabled mode. This checks rendered HTML; it does not contact Google, request ads, or validate account approval.
- Built and verified VERCEL_ENV=preview with ADSENSE_ENABLED=true: no ad loader or publisher declaration, plus noindex/disallow robots behavior.
- Rebuilt and reran checks in default review-only mode last. git diff --check passed. No deployment or push performed. Live browser ad delivery, CMP configuration and Search Console ownership/submission were not tested.

### Historical reference (preserved from the previous commit)

The sections below record earlier work, not freshly executed tests. Their earlier www canonical/redirect instructions and claims about no advertising and redrawn favicons are superseded by Current configuration and the change history above. Historical screenshots/Lighthouse values were reported by that implementation and are not new measurements.


#### Archived source: docs/deployment.md

## Deploying Vihar

### Project settings

The repository is already connected to [the Vihar project on Vercel](https://vercel.com/tirthankar-s/vihar). Its live catalogue is [www.vihar.online](https://www.vihar.online). Pushes to **main** trigger production deployments.

For the existing project, or when importing [the Vihar GitHub repository](https://github.com/tirthankardgen-cell/Vihar) into a new project, use:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | Repository root |
| Node.js | 26.x |
| Install command | npm ci |
| Build command | npm run build |
| Output directory | Leave the Next.js default |
| Production branch | main |

The framework and commands are also declared in vercel.json. All nine public pages are prerendered. Next.js serves optimized images and metadata routes; this is not configured as a static HTML export.

All assets needed by a fresh clone are committed. Asset generation is an authoring operation, not a build prerequisite. Keep package-lock.json and use npm ci so the deployed dependency tree matches verification.

### Domain and email

1. Keep **www.vihar.online** as the catalogue’s canonical domain.
2. Keep **vihar.online** redirected to **www.vihar.online**. The live setup returns HTTP 308 for this redirect.
3. For a fresh domain configuration, add both hostnames to the catalogue project and use the **exact DNS records shown by Vercel**. Wait for domain validation and HTTPS.
4. Leave **rasta.vihar.online** attached to the independent Bap Ka Rasta project.
5. Confirm **contact@vihar.online** can receive and reply to email through the owner’s mail provider. Web hosting does not create the mailbox or its MX records.

The owner confirmed the mailbox address and game hostname. Both the catalogue and game were reached over HTTPS on 31 October 2026; the game was also opened through to gameplay during implementation. No DNS or email-provider settings were changed by this work.

The brief proposed the apex domain as canonical. The implementation follows the existing live **www** redirect instead, so search engines receive a consistent final address. To switch to the apex domain later, reverse the Vercel redirect and change SITE_URL together, then redeploy.

### Environment

Defaults are suitable for the intended production domain:

~~~dotenv
SITE_URL=https://www.vihar.online
BAP_KA_RASTA_URL=https://rasta.vihar.online
SUPPORT_EMAIL=contact@vihar.online
~~~

These values are public configuration, not secrets. SITE_URL must be an HTTPS origin without a path, query, credentials, or fragment. The game URL must use HTTPS. Invalid values fail the build. Changes require a new build because pages are prerendered.

Vercel supplies VERCEL_ENV automatically. **Preview** builds emit noindex/nofollow metadata and disallow crawling in robots.txt. Keep the canonical origin set to the intended public domain, rather than a temporary preview URL. Robots directives discourage indexing; they are not access control. Use Vercel deployment protection for private previews if needed.

### Before sharing the production address

- Open the homepage, catalogue, both game pages, About, Help, Contact, Privacy, and Terms.
- Verify the homepage and detail-page Play links open **rasta.vihar.online** in a new tab.
- Try search, both availability filters, the empty state, mobile navigation, and the Help accordions.
- Confirm the contact email works in an email client.
- Check the mobile portrait and landscape layouts and keyboard focus.
- Visit /robots.txt, /sitemap.xml, and /manifest.webmanifest.
- Check that the production page source contains its unique title, description, canonical URL, Open Graph image, Twitter card, and JSON-LD.
- Confirm an unknown URL returns HTTP 404, not a successful homepage response.
- Share a game URL privately to inspect its social preview; platform caches can take time to refresh.
- Verify **vihar.online** redirects to the canonical **www.vihar.online** address.

### Search visibility

#### Favicon and public discovery — 2 November 2026

The production homepage and public pages declare `/brand/icon-192.png` as their first favicon, a square 192px PNG derived from the owner's original emblem. `/favicon.ico` remains a stable fallback. Google's current [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) recommends an image larger than 48px, a stable URL, and access for both Googlebot and Googlebot-Image. A generic globe in Search Console does not establish whether a page is indexed.

`/site-map` provides ordinary HTML links to all public pages, including the honestly labelled upcoming announcement, the gallery, and the independent game's `/guide.html`. Every page links to this directory from the footer. The XML sitemap includes completed public pages and representative artwork, screenshots, logo and favicon images. Account pages and the unfinished announcement remain crawlable but carry their existing noindex metadata; preview builds retain their existing crawl restrictions. `llms.txt` lists public resources but is not a Google indexing mechanism.

Live inspection before this change confirmed HTTP 200 for both canonical homepages, robots, sitemaps, ICO files and PNG icons, without blocking robots headers. The apex domain redirects to `www.vihar.online`; keep `SITE_URL=https://www.vihar.online` consistent with that redirect.

After deployment, submit both sitemaps in the matching Search Console domain properties:

- `https://vihar.online/sitemap.xml` under `vihar.online`.
- `https://rasta.vihar.online/sitemap.xml` under `rasta.vihar.online`.

Use URL Inspection → Test live URL → Request indexing for `https://www.vihar.online/` and `https://rasta.vihar.online/`, and inspect the new public directory and game guide. Google fetches the favicon from the homepage declaration; request indexing for the homepage rather than submitting the icon as a page. Recrawling may take days or weeks and favicon display is not guaranteed. These authenticated Search Console actions require the owner's account and are separate from the code changes and GitHub push.

Validation on Node.js 22.23.4: `npm run check` passed (lint, advertising/account tests, generated route types, TypeScript and production build); `npm run verify` passed across twelve public pages, nine noindex account pages, original-logo PNG pixels, all gallery/sitemap images, metadata and local links. Browser inspection without JavaScript confirmed all twelve directory links at desktop and phone widths, with no horizontal overflow. The independent game guide's five cities, six vehicles, twenty characters and twenty-nine landmarks also rendered without JavaScript; homepage-to-guide navigation and hydrated game selection passed without page errors.

After the custom domain is live, verify ownership in Google Search Console and submit:

~~~text
https://vihar.online/sitemap.xml
~~~

This requires access to the owner’s Search Console account and DNS or an approved verification method. The site does not invent a verification token. Indexing timing and search rankings are controlled by search engines, not guaranteed by the code.

The catalogue game page is canonical to **www.vihar.online/games/bap-ka-rasta**. The separate game project controls its own canonical metadata. If its page source still names a former deployment address, update that metadata in the game repository when maintaining it; this catalogue does not rewrite the game application.

### Performance and future integrations

Fonts are local. Newsreader includes only the 400 normal, 500 normal, and 400 italic faces the site uses; DM Sans remains variable. The smaller serif files load when used instead of competing with the hero through unconditional preloads. Images have reserved dimensions and responsive Next.js delivery. The hero loads eagerly with high priority; images below the fold load lazily. Only small navigation and catalogue controls require client-side state. The hero atmosphere is static and motion preferences are respected.

There are no advertising or analytics integrations to configure. If either is introduced, measure again with the real scripts and consent states. Follow the brief’s placement rules, disclose actual providers, and keep game launches independent from those services.

Local browser and Lighthouse results are in [verification history](#historical-reference-preserved-from-the-previous-commit). They are laboratory checks, not real-user Core Web Vitals or certification of every device.


#### Archived source: docs/verification.md

## Vihar verification

Verified on **31 October 2026** using **Node.js 22.23.4**, Next.js 16.4.3, and Chrome 156 on Windows. Public pages are prerendered; game engines remain on their independent deployments.

### Production checks

~~~sh
npm ci
npm run assets
npm run check
npm run verify
~~~

Asset generation completed successfully and reproduced the committed artwork, logo masters, icons, fonts, sharing cards, and optimized gameplay captures. ESLint, route type generation, TypeScript, and the production build passed.

The HTTP verifier starts and stops its own production server. It passed checks for all nine public routes, unique titles and descriptions, canonical URLs, Open Graph and Twitter metadata, JSON-LD, internal links, image and font assets, application icons, manifest, robots.txt, sitemap, launch addresses, support email links, response headers, and a genuine HTTP 404 for unknown pages.

Canonical comparisons normalize URLs, so equivalent homepage URLs with and without a trailing slash are accepted. Missing or incorrect canonical URLs still fail verification.

GitHub Actions repeats installation, checks, and production verification on main and pull requests using the Node.js version in `.nvmrc` on Linux.

### Chrome interaction and layout review

- All nine routes were checked at 320, 390, and 1440 px widths, plus 844 × 390 px landscape.
- The homepage was also reviewed at tablet widths. Images decoded successfully, and no horizontal document overflow was found.
- Keyboard checks covered the first-position skip link, focus transfer to main, mobile navigation, Escape closing and returning focus, route changes, and native Help accordions.
- Catalogue checks covered both availability filters, case-insensitive search, whitespace trimming, the empty state, clearing search, and resetting the collection.
- The coming-soon game has no launch action. Bap Ka Rasta links to its independent HTTPS address in an isolated new tab.
- Reduced-motion preferences disable smooth scrolling and transitions.
- No page errors, console errors, or failed catalogue requests were recorded during the interaction review.

Axe checked all nine pages at a mobile viewport against WCAG A/AA rules and accessibility best practices, including the label-in-name rule. **Zero violations were reported.** Manual keyboard and visual checks supplement this result; automated checks are not a full accessibility certification.

Review screenshots and local HTML/JSON Lighthouse reports are saved in output/playwright/, which is intentionally excluded from Git. The public sharing cards and game screenshots are committed production assets.

### Mobile performance

Lighthouse was run against the production server with its standard simulated mobile network and 4× CPU slowdown. The final scores and metrics are recorded below.

| Audit | Score |
| --- | --- |
| Performance | 91 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

| Metric | Result |
| --- | --- |
| First contentful paint | 1.4 s |
| Largest contentful paint | 3.4 s |
| Total blocking time | 90 ms |
| Cumulative layout shift | 0 |

The final report also passes the text-contrast and label-in-name audits. Local LCP is above the brief's 2.5-second target; that remains an optimization target for measured production performance.

Newsreader now includes only 400 normal, 500 normal, and 400 italic. These files total about **70 KB**, down from about **123 KB** for the previous serif variable fonts. DM Sans remains local and variable. Only DM Sans is unconditionally preloaded; the hero image has high fetch priority and responsive sizing.

These are laboratory measurements, not real-user Core Web Vitals. Measure the deployed site again when traffic is available and before adding analytics or advertising. The brief's 2.5-second LCP goal remains a target rather than a claim of measured field compliance.

### Live hosting

The catalogue was reached over HTTPS at **www.vihar.online**. **vihar.online** returns HTTP 308 to that address, so the website's canonical origin and sitemap follow the existing www configuration. Bap Ka Rasta returned HTTP 200 over HTTPS at **rasta.vihar.online** and was opened through to gameplay during implementation.

The supplied support address is wired across Contact, Help, policies, and the footer. Sending and receiving email requires the owner's mailbox; no test email was sent.

For project settings, domain management, environment variables, and Search Console submission, see [deployment history](#historical-reference-preserved-from-the-previous-commit).


#### Archived source: assets/README.md

## Vihar asset register

Source files in this directory are authoring inputs, not public downloads. Optimized production copies live in public/.

| Asset | Source and author/tool | Usage and rights |
| --- | --- | --- |
| Root logo.png | Logo concept supplied by the project owner | Reference for the Vihar emblem and uppercase wordmark; the small vihar.com text in the concept is superseded by the brief’s vihar.online |
| public/brand/*.svg | Original paths authored in scripts/generate-assets.mjs from the supplied concept | Vihar vector masters: horizontal, inverse, stacked, emblem, and monochrome |
| Favicons and application icons | Generated from the Vihar emblem with Sharp | Small-size variant has wider gaps; maskable icon respects a central safe region |
| original/courtyard.svg | Original Vihar illustration authored in the asset generator | Hero artwork: open gateway, player, path, kite, and palms |
| original/playground.svg | Original Vihar illustration authored in the asset generator | Editorial artwork inspired by courtyard play; not a claim to reproduce a historical game board |
| original/gulam-chor.svg | Original Vihar illustration authored in the asset generator | Clearly labelled concept art, not an assertion of approved gameplay or game rules |
| original/bap-ka-rasta-landing.webp | Existing Bap Ka Rasta landing artwork from the owner’s game project | Original generated game concept image; used for the cover, feature, and game sharing card with concept labels |
| original/bap-ka-rasta-gameplay.png | Chrome capture of the owner’s live game at https://rasta.vihar.online | Actual third-person gameplay, 1440 × 900; captured during this implementation |
| original/bap-ka-rasta-camera.png | Chrome capture of the same live game | Actual driver-camera gameplay, 1440 × 900; captured during this implementation |
| public/images/social-*.png | Composed locally from the above assets and Vihar vector logo | 1200 × 630 Open Graph and Twitter sharing cards |
| public/fonts/dm-sans-*.woff2 | DM Sans via @fontsource-variable/dm-sans | SIL Open Font License 1.1; see public/fonts/dm-sans-LICENSE.txt |
| public/fonts/newsreader-*.woff2 | Newsreader 400 normal, 500 normal, and 400 italic via @fontsource/newsreader | SIL Open Font License 1.1; see public/fonts/newsreader-LICENSE.txt |
| Interface icons | lucide-react | ISC; upstream dependency licence applies |

The original project code and assets do not have a general redistribution licence. The owner’s original assets retain their existing ownership. Third-party licence terms apply only to their respective materials.

Sarvam’s live homepage was reviewed in Chrome as a reference for warm gradients, spacious layout, serif typography, and minimal navigation. No Sarvam illustration, logo, copy, or source code is included. All courtyard, card, and play-board compositions were authored for Vihar.

### Reproduction

With the Node.js version in `.nvmrc` and the locked dependencies installed:

~~~sh
npm run assets
~~~

The script copies licensed font files, writes the logo masters and editable original SVG illustrations, rasterizes WebP artwork, optimizes the saved game captures, and composes sharing cards. It does not contact a remote image generator or recapture the game.

Game captures can become outdated as the independent game changes. To refresh them, launch the current game in Chrome, capture actual third-person and driver-camera views at 1440 × 900, replace the two original PNGs, and run the asset command. Keep concept and gameplay labels accurate.

### Node.js 26 deployment alignment — 2026-11-02

Author: Codex. The owner's Vercel screenshot showed the repository's Node.js 22.x engine overriding the project's selected 26.x runtime. Set `package.json` to `engines.node: "26.x"` and `.nvmrc` to `26`, so Vercel, local development and both GitHub Actions jobs select the same major version. Updated `@types/node` to 26.x and regenerated `package-lock.json` with npm 11.20.0. Updated README and operational version instructions; historical validation records retain their original Node.js versions.

Validation used the official, SHA-256-verified Node.js 26.13.0 Windows distribution and npm 11.20.0. A clean `npm ci` passed. Strict lint, all ten AdSense/account tests and TypeScript checks passed. The first build attempt in `npm run check` encountered an existing Next.js build lock; after it cleared, `npm run build` passed and generated all 28 static pages. `npm run verify` passed for twelve public routes, nine account routes, metadata, links, assets and the existing rendering/advertising checks. All fourteen Firestore authorization tests passed with Node.js 26 and Java 21 against the isolated `demo-vihar` emulator. Logs are under ignored `output/node-runtime/`.

The locked Firebase CLI still pulls in `superstatic@10.0.0`, whose declared Node support ends at 24. npm reports an engine warning for that Firebase Hosting helper; installation and the Firestore tests succeeded on 26. This project serves the website through Next.js on Vercel. Existing upstream ESLint peer and package deprecation notices also remain.

Release through the existing GitHub `main` branch and Vercel connection. Keep Vercel's Node.js setting at `26.x` to match the repository, and inspect the hosted deployment status on the new commit after pushing.

### Bap Ka Rasta branding and Vihar launch campaign — 3 November 2026

The game is positioned as free-roaming driving through familiar Indian cities, with a growing vehicle and city line-up. Availability is shown on individual cards rather than defining the brand as an auto-only Mumbai game.

Source of truth: `tirthankardgen-cell/Bap-Ka-Rasta` commit `98eb1c86dc7af980f4623c367bbf5182f89973b3`. The updated map comes from `docs/maps/mumbai-game-map.png`; city renders come from `docs/mumbai-landmarks/`. The official BR vector is copied unchanged from `public/brand/br-mark.svg`. Vihar retains its existing original identity.

All 13 vehicle portraits were rendered directly from the shipped `gallery-traffic.glb` and `mumbai-auto.glb` using Three.js GLTFLoader with MeshoptDecoder and Chromium software WebGL. Portraits retain the actual model shapes, including the Dio-style scooter and naked Duke-style KTM. The complete vehicle-library studio image is copied from `assets/vehicles/gallery-traffic/preview.webp`. The remaining twelve cast portraits are extracted from the original `docs/mumbai-characters/renders/street-crowd.jpg`, bringing the gallery to all 20 authored characters.

Third-person and driver-camera gameplay captures were taken from the current local game build, after selecting Mumbai, the available auto, and Drive without intro. The conversation capture is retained and labelled as earlier-build material. Generated hero, garage, character-market and city artwork uses the game’s current model/reference images and is always labelled as promotional concept artwork. It does not stand in for gameplay screenshots or a real navigation map.

The gallery has 57 entries with crawlable full-size links, descriptions, dimensions, image structured data and sitemap entries. The sitemap now revalidates hourly and records a fixed content modification date for pages changed by this release. It does not manufacture new modification dates on each request. Google determines crawl and indexing timing.

`launch-kit/instagram` contains 15 individual 1080×1350 posts: four Vihar introductions/brand posts and eleven Bap Ka Rasta posts. `campaign.json` and `captions.md` contain the relative day sequence, copy and alt text. No social posts were published. Profile exports use Vihar’s original vector emblem with safe margins; there is no Bap Ka Rasta account DP. Facebook cover exports are supplied at 1640×624 and 820×312.

Reproduce website assets with `node scripts/refresh-bkr-brand.mjs`. Poster exports use `scripts/render-launch-kit.mjs` and `scripts/render-social-campaign.mjs`; supply `PLAYWRIGHT_MODULE` pointing to an installed `@playwright/test/index.mjs` and a local Chromium binary. The original Barlow font licence is preserved beside its webfont. Social campaign exports are not loaded by the website.

### Creator studio and shared ratings — 4 November 2026

Adapted the staged publishing and content/analytics separation described in official YouTube Studio guidance: https://support.google.com/youtube/answer/57407 and https://support.google.com/youtube/answer/9002587. Public UI keeps Vihar branding and the existing charcoal/amber account theme.

The creator editor now supports Details → Images & play guide → Preview → Visibility. Community documents optionally include `coverUrl`, up to six `screenshots`, `howToPlay`, `controls`, `requirements`, and `genre`. Images use public HTTPS URLs and render directly in the visitor's browser, with no-referrer and a broken-image fallback; this does not upload files to Vihar Storage. Existing documents without these fields remain readable. The editor requires a cover and play guide for publishing and supports incomplete drafts, editing and unpublishing. Server-rendered public data includes the new fields.

Content and Analytics show real lifetime unique signed-in game opens, average ratings and review counts. No synthetic traffic, live-player or gameplay telemetry is introduced. Thumbnail ratings use Firestore aggregate reads; the feedback panel has live reviews and a star distribution. `officialGames/bap-ka-rasta/players/{uid}` and `reviews/{uid}` add the same immutable launch receipt and one-review-per-player behavior for Vihar's deployed game. Official play buttons on the detail page and dashboard record launches for signed-in players without blocking anonymous play. Upcoming games display a release-dependent review state. Add newly released official IDs to the rules allowlist when shipping them.

Dashboard routes omit the footer. At widths of 768px and above, the dashboard fills the viewport below the header and gives the navigation and content separate keyboard-focusable scroll areas. Mobile retains document scrolling. Route transitions reset the content pane to its introduction.

Release dependency: deploy `firestore.rules` to the existing Firebase project before releasing the UI. The connected environment has no production Firebase/Vercel credentials. Rules emulator validation was attempted but its JAR download from storage.googleapis.com was blocked by the environment network policy; this is not a passing rules result. Run `npm run test:rules` in an environment that can download the emulator. No Storage or composite-index migration is needed.

Validation: lint, 14 unit tests, TypeScript, production build and `npm run verify` passed. The production verifier covered public/account routes, assets, SEO and the homepage CSS budget (41,878 bytes). A temporary browser fixture using the actual editor and dashboard styles exercised all four steps, preview contents, independent desktop pane scroll positions (content 240px, navigation 110px, document 0px), 390px mobile width without overflow, and footer absence on the actual dashboard route. The fixture was removed before the final build. Authenticated publishing/review writes remain unverified end-to-end because the Firestore emulator download is unavailable; rules tests were added for media validation and official-game authorization. No production deployment was performed.

### Gulam Chor browser launch — 5 November 2026

Gulam Chor is now a playable Vihar title linking to https://gulamchor.vihar.online. The detail page adopts the deployed game's green courtyard, cream/gold palette, Hindi Yatra One title, Hind body text, bilingual invitation and family portraits. It explains the shipped preview accurately: one human against virtual players, 2–6 seats, 51 cards, automatic same-rank pairs, anticlockwise draws and the last unmatched Jack. Catalogue, home hero, favourites, help/FAQ, site directory, llms.txt and search metadata now describe the live release; Cards and Solo filters include it.

The courtyard, emblem, six portraits and Jack in public/images/gulam-chor are unchanged assets from the deployed game's /art/studies/ directory; all nine referenced SVGs were compared with their live counterparts by SHA-256. assets/original/gulam-chor preserves actual 1280×720 landing/table and 390×844 mobile table captures. Run node scripts/refresh-gulam-chor.mjs to export the WebP screenshots and social image; npm run assets also invokes it. New listings use /images/gulam-chor/landing.webp so cached copies of the former announcement art cannot replace the launch image. The older public image URL remains available. Bundled Hind and Yatra One files retain their SIL Open Font Licenses.

GULAM_CHOR_URL is an optional HTTPS destination override; the production default is the verified game domain. The game page is now indexable, with VideoGame data, screenshot metadata, crawlable full-size screenshot links and image sitemap entries. Original artwork and actual gameplay are labelled separately.

Validation: npm run check passed under Node.js 26.13.0 (lint, 14 unit tests, type generation/TypeScript and the 29-page production build). All 21 Firestore authorization tests passed with Java 21 against the isolated demo-vihar emulator, including launch/review ownership and the newly released game's allowlist entry. npm run verify passed for 12 public routes, 10 account routes, image proportions/cache/format and size budgets, links, SEO and existing advertising safeguards. Playwright checked the page at 1440×900, 390×844 and 320×740; the narrow layouts had no horizontal overflow and the mobile page had no broken images. Desktop/mobile screenshots are retained in ignored output/playwright.

The existing production Firestore rules were backed up in ignored output/gulam-release and compared before deployment. The only semantic change was adding gulam-chor alongside bap-ka-rasta to the official-game allowlist. Firebase compiled and deployed the rules successfully to vihar-27 using the existing authorized account before publishing the dependent UI.

### Interactive Vihar ID cards — 6 November 2026

Author: Codex. Replaced the dashboard's static ID link with the supplied Kokonut UI Flick Card v2.0.0 interaction, and added the same player card to public profiles. The front uses the player's existing portrait, display name and username; the back shows public membership details and a working profile link. The dashboard also keeps a separate public-profile link. Cards remain visible on phones, and the public profile places the card beside its details on desktop and above them on mobile.

`src/components/ui/card-flip.tsx` and its CSS module adapt the original spring, flick projection, hover tilt, lighting, thickness and shadow without new dependencies. Pointer cancellation returns to the starting face, vertical touch scrolling is preserved, and reduced motion skips both spin and hover, including during a drag. Enter, Space and an explicit flip button provide keyboard operation; the hidden face is inert and removed from the accessibility tree. `src/components/account/vihar-id-card.tsx` and its CSS module supply Vihar's faces and responsive typography. The resting face aligns with the perspective plane to keep text sharp. The source attribution and complete MIT license are recorded in `THIRD_PARTY_NOTICES.md`.

Validation passed with Node.js 26.13.0: `npm run check` (lint, 14 unit tests, type generation/TypeScript and the production build), `npm run verify`, and all 21 Firebase authorization tests with Java 21. Pulled the newer search/canonical-domain commit `f2d84e4` from `origin/main` without conflicts and reran the application and HTTP checks with `SITE_URL=https://vihar.online`.

Playwright used synthetic players in the local `demo-vihar` emulators. Checks covered dashboard and profile widths from 320 to 1440 pixels, maximum-length display names/usernames, click and keyboard flips, mouse and native touch drags, cancellation, reduced motion, hidden-face tab order, independent dashboard scrolling and navigation from the back of the card. The share dialog still prepares the 900 × 1200 PNG, downloads it with the correct filename and copies the player's profile link. Screenshots and local verification scripts are retained in ignored `output/playwright/id-card/`. Browser tests did not send a photo to an external app. No data migration or Firebase rules deployment is required for this change.


### Reviews and dashboard activity — 2026-11-08

Official game pages now initialize auth even without the optional local-storage hint. Sign-in accepts the two released official-game return paths. Guest play in the same tab can restore the immutable review receipt after sign-in without inventing a dated activity event. Reviews have explicit write/edit/cancel controls; a successful create or update closes the editor, while failed writes retain the draft. The Gulam Chor hero links directly to a contrasting cream review panel, and opening a game offers a dismissible review reminder.

Every signed-in official play link (including homepage, vehicle, dashboard and site-directory links) and non-creator community launch records an immutable private `players/{uid}/activity/{eventId}` event. A transaction creates the first-review receipt when absent and the new event using server timestamps. Firestore limits these records to the owner, released official games or published non-owned community games, and their actual titles. Clients still cannot award trusted game stats. The dashboard shows the last 365 UTC days of real website opens, with a 90-day calendar option and recent opens. It labels this as game opens, not completed rounds or measured play time. Earlier and guest play is not backfilled. Private activity is included in account exports and the privacy notice.

Validation: Node.js 26 lint, 15 unit tests, TypeScript, production build and site verification passed; 23 Firestore emulator tests passed, including atomic receipt/activity creation, private history, immutable timestamps, invalid IDs/titles, and community publication rules. Playwright against local demo-vihar emulators exercised guest play to sign-in to review, create/update/delete closure, reload persistence, cancel, three actual signed-in play clicks yielding exactly three persisted opens, live dashboard updates, range/day selection, and layouts at 320, 390 and 1440 pixels. Artifacts remain in ignored output/playwright. No production test reviews or fabricated player history were written.

Release requires the additive activity rules before the website. The deployed vihar-27 rules were read and backed up to ignored output/review-activity/production-before.rules; the only database-rule change is the private activity collection. Firebase compiled and deployed these rules successfully with the existing authorized project account. The requested main push and production readback follow.

### Originals and community discovery — 2026-11-08

Author: Codex. Added dedicated `/games/originals` and `/games/community` collections, origin badges, publisher links and consistent attribution on the homepage, game cards/details, profiles, publishing previews and account activity. The Games landing page uses a horizontal Community Top 5 and mixed recommendations. Rankings include only published community games with real reviews, ordered by average rating and then review count; recommendations include both origins and place unrated games afterward. An empty Top 5 does not render fake entries or numbered placeholders. Existing player reviews supply written feedback and creator links; community play opens a new tab so players can return to the listing.

`community-highlights.tsx`, `community-ranking.ts` and the discovery styles implement the artwork carousels. Native smooth scrolling and snapping, touch gestures, arrow controls, keyboard focus, hover transitions and reduced-motion support preserve the site's warm theme. Scrollbars are hidden. Dedicated rank-number space prevents number 4 from disappearing behind its card. All local sample games existed only in an isolated in-memory emulator; fixture files and screenshots remain under ignored `output/playwright/` and were excluded from the production build.

Collection metadata, breadcrumbs and ItemList data, community publisher schema, FAQ/about copy, `llms.txt`, navigation and the site directory describe the publishing platform consistently. `robots.ts` explicitly allows search crawlers while preserving preview restrictions. `sitemap.ts` adds collections and community cover/screenshot URLs, retains daily change hints and five-minute cache refresh, and records substantive modification dates. `scripts/submit-indexnow.mjs` verifies the deployed public key and canonical sitemap before an explicit submission. `docs/DISCOVERY_AND_INDEXING.md` covers operation and the limits of crawler checks; indexing remains controlled by search engines.

Validation passed with Node.js 26.13.0: `npm run check` (lint, unit tests, type generation/TypeScript and the 31-page production build), `npm run verify` (14 public routes, 10 account routes, metadata, assets, links, headers, sitemap/robots and advertising safeguards), and all 23 Firestore authorization tests using Java 21. Homepage CSS measured 62,250 bytes within the revised 64 KiB budget; carousel-specific CSS is scoped away from the homepage. No Firebase rules change or data migration is required.

Playwright checked rank 4, hover lift, hidden scrollbars, reduced motion, the play/review/profile flow and widths of 1440, 768, 390 and 320 pixels against isolated emulator fixtures. After stopping those emulators, the normal-environment production build passed search, category, availability and reset interactions plus responsive checks on the homepage, Games, both collections and both official detail pages. No horizontal page overflow, placeholder content or JavaScript page errors appeared. Production screenshots are retained in ignored `output/playwright/discovery-production-*.png`.

Before release, Bingbot/Googlebot user-agent requests to the live homepage, robots, sitemap and brand images returned HTTP 200 without a blocking X-Robots-Tag. These requests do not establish access from Bing's own crawler IP addresses. The exact reported denial was not reproduced. Delivery uses the authorized GitHub main push and existing deployment connection; verify the resulting commit status and live canonical routes before running IndexNow. Google Search Console resubmission requires access to the owner's verified property.
