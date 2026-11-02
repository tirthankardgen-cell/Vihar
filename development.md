# Vihar development record

This is the single developer handoff, operational guide, asset register and change history. Read this file before changing the site. Keep README.md as a short entry point. Append dated entries with author, intent, files, checks and remaining work; never claim an unrun test passed. Use the existing checkout in isolated cloud tasks; do not create a worktree unless requested.

## Current configuration

- Canonical site: https://www.vihar.online; preserve the apex-to-www redirect in Vercel.
- Node.js 26.x in package.json, .nvmrc and Vercel; npm ci; npm run check; npm run verify. GitHub Actions reads .nvmrc. Build before verify.
- AdSense publisher: ca-pub-6693217545827146, explicitly supplied by the owner. This is a public identifier, not a secret.
- Default mode: review-only. Keep the public ownership meta tag and /ads.txt, but do not load advertising. ADSENSE_ENABLED=true, ADSENSE_SITE_APPROVED=true and ADSENSE_CONSENT_READY=true are ALL required before the loader appears, and Vercel previews always suppress it. The approval and consent flags record account-side checks; they do not grant approval or collect consent. An old deployment with ADSENSE_ENABLED=true alone now fails closed. This supersedes earlier all-page loader instructions.
- The completed /guides/bap-ka-rasta-first-drive article is the only advertising candidate. Root layout, home, catalogue/search, game launch/detail, upcoming, support, legal and 404 pages never render the loader. SiteLink uses full-document navigation into/out of the article so Google scripts and inserted ads cannot persist on excluded pages. Other links retain Next.js navigation. The script is async and hoisted by React to the head only on a successful article render. A hydrated article error leaves the document for the ad-free Help page.
- The upcoming Gulam Chor announcement remains accessible and correctly labelled, but is noindex and omitted from the sitemap and llms.txt until substantive gameplay information is available. This is an editorial choice, not a claim that noindex exempts a page from Google's policies.
- ADSENSE_PUBLISHER_ID overrides the default; explicitly empty with ADSENSE_ENABLED=false disables account metadata/declaration. Invalid IDs fail the build. Preview builds omit the publisher declaration and loader.
- GOOGLE_SITE_VERIFICATION optionally adds the Search Console HTML verification tag. The owner has not supplied a token. DNS verification can be used instead.
- Submit https://www.vihar.online/sitemap.xml to Search Console after deployment. Review robots.txt, manifest.webmanifest, ads.txt and llms.txt. Search Console submission and AdSense review remain account-side actions; code does not guarantee approval, indexing or ranking.
- Sitemap and robots already existed and are retained as Next.js metadata routes, avoiding duplicate static files. llms.txt is an optional factual discovery aid, not a recognized ranking guarantee. Visible FAQ answers and FAQPage JSON-LD share one source; Google generally restricts FAQ rich results to eligible government/health sites. Do not promise them for this game catalogue. Use accurate prose instead of keyword stuffing, fake reviews or fabricated ratings.

## AdSense review and account setup

### Findings from the 31 October 2026 review

The owner's screenshot and rejection email give a general policy rejection, without a named violation. Ownership is already verified. Live checks confirmed the expected publisher declaration at both apex and www /ads.txt (apex redirects to www), an accessible robots.txt, and the playable game on rasta.vihar.online. The pre-fix homepage loaded Google's ad code without a browser error. This was not an incorrect publisher ID or a missing ads.txt.

The previous shared head loaded ad code on every page, including a short upcoming-game announcement, navigation/search screens and 404s. Google explicitly disallows ads on screens without publisher content, with low-value content, under construction, or used for navigation/alerts. The privacy notice also asserted a configured consent message without supporting account evidence and did not explicitly describe cross-site cookie use and other vendor opt-outs. These are observable risks addressed here, not a claim to know Google's undisclosed rejection reason.

The new guide adds practical publisher content: starting the actual build, using gears, choosing a route through the authored map, cameras, recovery and device settings. Its facts were checked against the current game README and live launch flow. It uses existing actual gameplay screenshots, identifies Vihar as publisher, links the source build notes, and distinguishes arcade streets from real-world geography. No invented reviews, ratings, traffic, release promises or keyword-filled filler are used. There is no guaranteed page count, word count or waiting period that secures approval.

### Account steps after deployment

1. Confirm the deployed site matches this change: the guide is reachable through normal navigation, the privacy notice says advertising is disabled, /ads.txt still has the correct publisher, and 404/upcoming pages contain no advertising loader. Keep all three advertising flags false while approval is pending. Ownership review can use the existing Google AdSense meta tag or ads.txt; running Auto ads on every page is unnecessary for verification.
2. In AdSense **Sites > vihar.online**, read any additional details that appear, confirm the real fixes and use **Request review**. Do not submit a false compliance confirmation. The repository cannot submit this authenticated account action or guarantee the review outcome. If Google identifies another issue, use its exact wording for the next investigation.
3. Before serving, use **Privacy & messaging** to publish Google's certified European regulations message for the site with the required choices, publisher privacy URL, and applicable vendors. Configure applicable US state privacy messages/opt-out links as well. Check the actual message in the affected regions, including accept, reject, withdrawal, and vendor disclosures. Non-personalized ads are not a blanket exemption from consent requirements. The code does not implement a substitute CMP or fabricate consent. Google loads the published message via its ad code; the guide's Privacy and cookie settings control uses the documented googlefc consent API to reopen the European message. Google's configured US state message must expose its own opt-out entrypoint.
4. Configure **Auto ads** for this domain before enabling: only the completed guide may be monetized. Add an exact homepage-only exclusion for / (do not exclude the entire site), plus exclusions for /games (including children), /about, /help, /contact, /privacy and /terms; keep navigation, table-of-contents and privacy controls outside placement areas. Turn off vignette, anchor, side-rail and ad-intent/overlay formats for this small catalogue; inspect in-page placement on the guide at desktop and phone widths. Preserve the brief’s ceiling of one clearly labelled ad visible at a time; leave serving disabled if the configured placement cannot meet it. Do not put ads beside Play, game controls, or in a game-loading screen. These account settings complement the code's route allowlist. New guides need a deliberate content/placement review before adding them to the allowlist.
5. Only after **Sites** shows **Ready** and the consent/placement checks actually pass, set all three flags to true and redeploy. A flag is an operator confirmation, not proof of approval or a visitor consent signal. Test with the real published CMP before leaving serving enabled; use ADSENSE_ENABLED=false to pause immediately if something is wrong. Content and game launch must remain usable when ads are blocked, declined, unavailable or fail to load. Do not click live ads to test them or generate artificial visits/impressions.

Local enabled-mode browser checks intercept Google requests with an inert test stub, so they verify script/navigation/consent-control behavior without requesting live ads. They do not certify account settings, real CMP regional behavior, ad placement, or approval.

### Official sources consulted online

Retrieved directly from Google on 31 October 2026:

- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en): valid traffic, honest navigation, placement and site behavior.
- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en): inventory value, ads interfering with interactions, and privacy disclosures.
- [Google-served ads on screens without publisher-content](https://support.google.com/publisherpolicies/answer/11112688?hl=en): no ads on low-value, unfinished or navigation/alert screens.
- [Required privacy content](https://support.google.com/adsense/answer/1348695?hl=en): Google/third-party cookies, prior visits to other sites, and personalized-ad opt-outs.
- [Google consent management requirements](https://support.google.com/adsense/answer/13554116?hl=en): certified CMP and TCF requirements for personalized ads in the EEA, UK and Switzerland; EU consent policy still applies.
- [Privacy & messaging JavaScript API](https://developers.google.com/funding-choices/fc-api-docs): CONSENT_API_READY callback and showRevocationMessage.

## Vihar ID configuration and operations

Vihar ID uses Firebase Authentication and Cloud Firestore in project `vihar-27`. It is an optional account layer on this website. The independent game applications have not been modified, so they still launch as guests and do not yet submit statistics or share a browser session. Do not describe the current release as automatic cross-domain single sign-on.

### Deployment

1. Use Node.js 26.x and the existing Vercel Next.js preset. Set the seven `NEXT_PUBLIC_FIREBASE_*` web configuration values listed in `.env.example` from Firebase Project settings → Your apps. Set `NEXT_PUBLIC_FIREBASE_EMULATORS=false` on deployments. Public variables are embedded at build time; save them before the deployment or rebuild after changing them. Local values belong in ignored `.env.local`. Never put Firebase Admin credentials, service-account JSON, private keys or login tokens in public variables.
2. Enable Email/Password and Google in Firebase Authentication. Add `www.vihar.online` and `vihar.online` to Authorized domains, and add a specific preview domain if testing Google sign-in there. The owner confirmed both providers and the production domains; the domains were also checked through the public Firebase configuration endpoint. Keep the supplied `vihar-27.firebaseapp.com` auth domain unless the Firebase auth-handler setup is deliberately changed.
3. Create the default Cloud Firestore database if necessary. Publish the exact contents of `firestore.rules` under Firestore Database → Rules. These are rules for this account schema; do not use blanket test-mode access. `firestore.indexes.json` uses the standard single-field indexes, including the membership array used to query friend connections.
4. With an authorized Firebase CLI login, the equivalent command is `npx firebase deploy --project vihar-27 --only firestore:rules,firestore:indexes`. The saved login on this workstation returned 403 for this project. The owner published the rules through Firebase Console on 1 November 2026. Subsequent live read-only checks confirmed a missing public username returns `NOT_FOUND`, while bulk profile listing and private favorites return `PERMISSION_DENIED`. Future rule deployments still need project-owner access; do not mistake passing emulator tests for live deployment.
5. Avatars ship as local SVG assets, so Cloud Storage is not required. If a bucket is enabled, publish `storage.rules` or run `npx firebase deploy --project vihar-27 --only storage`. The rules deny all uploads and downloads because this release has no user-upload feature. This does not affect bundled website assets.
6. Firebase's default hosted verification/reset links work. For the matching Vihar email screens, set the action URL in Authentication → Templates for email verification and password reset to `https://www.vihar.online/auth/action`. Leave Firebase's generated `mode` and `oobCode` query parameters intact. The page consumes the code, waits for persisted authentication, and refreshes the verified token before returning to the dashboard. Its HTTP and HTML referrer policy is `no-referrer`.
7. Configure the Firebase password policy to match the UI: at least 8 characters, an alphabetic character and a number. Firebase enforces its own account-side policy; client validation alone is not a server policy. Email enumeration protection is compatible with the generic sign-in/reset responses. Complete a real Google and email sign-in, verification, username claim and friend request after deploying the environment and rules.

Web API keys identify a Firebase application; they are not a substitute for authorization. The implementation intentionally does not initialize Analytics even when a measurement ID is supplied. Authentication and Firestore are loaded when an account route is visited, or when a returning player's local hint indicates a prior sign-in. The hint only controls loading and never authorizes access. Google uses a popup so a blocked or dismissed popup produces a recoverable message; the site sends `Cross-Origin-Opener-Policy: same-origin-allow-popups`.

### Account routes and data

- `/signup`, `/login`, `/forgot-password`, `/auth/action`: Google/email sign-in, registration, email verification and password recovery.
- `/dashboard`, `/dashboard/games`, `/dashboard/friends`, `/dashboard/settings`: account onboarding, overview, saved games, friend requests, profile editing, provider linking and JSON data export. Unauthenticated visits return to login with an allowlisted local destination. Changing UID clears the previous account's profile and subscriptions.
- `/u/{username}`: a public profile link with avatar, display name, bio and published game statistics. Email stays in Firebase Authentication. Sharing uses the native share sheet where available, then clipboard, then a selectable link fallback. All account/profile routes are noindex, absent from the sitemap and advertising-free.

| Path | Visibility and allowed writes |
| --- | --- |
| `profiles/{uid}` | Public exact reads. Owner can atomically create a profile with a username claim, then edit only display name, bio and avatar. No public/private email field is allowed. Listing profiles and client deletion are denied. |
| `usernames/{username}` | Public exact lookup. A claim is created atomically with its owner's first profile and is immutable. Collection listing is denied. |
| `profiles/{uid}/stats/{gameId}` | Public game statistics. Every client write is denied; only a trusted backend can publish validated results. |
| `players/{uid}/favorites/{gameId}` | Private to the owner. Known game IDs only; creation uses a server timestamp and deletion removes the favorite. |
| `friendships/{from}__{to}` | Participants only. Verified senders create pending requests; verified recipients accept; either participant can cancel, decline or remove. Reciprocal duplicates and other field changes are denied. |

Usernames are canonical lowercase, 3–20 characters, start with a letter, and contain only letters, digits or underscores. Reserved administrative names are rejected by both the UI and rules. The availability check is advisory; a transaction and `getAfter` rule checks prevent two simultaneous registrations from claiming the same name. Existing usernames remain permanent. Exact public lookup does not prevent someone guessing individual usernames; the rules deny bulk collection enumeration rather than making public profiles secret.

Profiles contain `uid`, `username`, `displayName` (1–32 characters), `bio` (up to 160), `avatarId`, `createdAt`, and `updatedAt`. Friends contain `from`, `to`, ordered `members`, `status`, and timestamps. Signed-in clients can read a missing friend document to perform the atomic reciprocal-request check, but cannot read an existing connection unless they participate. Email verification changes must reach the Firebase ID token as well as the local user object before verified-only writes; friend creation/acceptance refreshes the token before Firestore applies its rules.

Players can link Google to an email account, or set a password on their Google account, retaining the same UID, username and profile. Sensitive Firebase operations can require a recent sign-in. The app never stores passwords. Data export includes the current account's profile, statistics, favorites and connections, excluding tokens. Account deletion is currently handled through the published support mailbox; an authorized backend/operator must remove Auth and related Firestore data together. A bare client-side Auth deletion would strand an immutable username, so it is not offered.

### Future game integrations

Use Firebase project `vihar-27` to authenticate future games and use the Firebase UID as the permanent account key. Usernames are a public display/lookup layer. Firebase browser persistence is origin-scoped: using the same project across game domains preserves identity, but does not itself transfer a signed-in browser session. An explicit future cross-domain handoff needs a trusted server with a short-lived, single-use exchange, a fixed destination allowlist, and server-side token verification. Never pass Firebase ID/refresh tokens in profile links or query strings.

The stats document contract is `{ sessions, playSeconds, bestScore?, distanceMeters?, lastPlayedAt, dailySessions? }`, keyed by the known game slug. Counts and durations must be nonnegative and validated by the game backend. `dailySessions` is an optional map of UTC dates to nonnegative integer session counts, for example `{ "2026-11-01": 3 }`. The dashboard sums these daily records across games for its 90-day/year activity calendar. It never infers daily history from aggregate sessions or a last-played timestamp, and shows an empty state until daily records exist. Invalid dates/counts and future/out-of-range entries are ignored. These records share the existing public stats visibility and server-only write policy; no new collection or client write permission is introduced.

The dashboard also summarizes games with sessions, elapsed time, session count, recent activity and milestone states. Client requests must not directly award scores or increment play time. A future backend must verify Firebase ID tokens, bind results to the authenticated UID, validate the actual game result, deduplicate submissions, then write with the Admin SDK. Publishing additional private stats into the currently public `stats` collection would require a schema/rules change. Add new favorite game IDs to the rules along with their catalogue entries.

### Personal ID cards and sharing

`/u/{username}/card` returns the player's vertical 900 × 1200 PNG card and is linked by **Download ID card** on their profile. This same portrait is the profile's Open Graph and Twitter image, with explicit portrait dimensions and a format/profile version in its URL. The previous `?format=preview` URL also returns the portrait; there is no wide banner variant. `?download=1` returns the PNG as an attachment. No account login is required for a sharing crawler.

**Share ID card** opens a portrait preview from the dashboard, friends, settings and public profile. On browsers supporting Web Share files, a second tap sends the actual PNG plus the public profile URL to the chosen app. The PNG is prepared before that tap to preserve transient user activation on phones. Browsers without photo sharing can download the card and attach it manually. Copying the profile link remains available, including a selectable link when clipboard access fails. WhatsApp and other apps control their own link-preview size/cropping; sending the PNG as a photo preserves the vertical image. Existing messages and cached link previews do not change immediately.

The renderer only performs the two exact public Firestore reads already allowed by the published rules, and uses the display name, username, chosen catalogue avatar and join date. It does not use an Admin credential or include email, tokens, private data or arbitrary remote images. Missing players return 404 and temporary failures return an uncached 503. Public profile fetches revalidate after 60 seconds and card responses cache at the CDN for five minutes; third-party sharing services maintain their own preview caches. The six SVG portraits and brand emblem are explicitly included in the card route's deployment trace.

### Avatar assets and reproduction

The six avatars are original, code-authored vector gamer portraits with faceted shapes, dark materials and restrained accent colors. They contain no third-party characters, external requests, uploads or generative-image dependency. Rebuild them with `npm run assets:avatars` (`scripts/generate-avatars.mjs`). Stable storage IDs are retained independently of the visible names:

| ID / file | Name |
| --- | --- |
| `sun.svg` | Vanguard |
| `moon.svg` | Phantom |
| `tiger.svg` | Ronin |
| `frog.svg` | Vector |
| `kite.svg` | Nomad |
| `planet.svg` | Orbit |

### Local Firebase testing

Use Node 26 and Java 21 or newer. Run `npm ci`, then `npm run test:rules` for the isolated Firestore rule suite. CI installs both runtimes. For manual account tests, run `npm run emulators`, then start Next with `NEXT_PUBLIC_FIREBASE_EMULATORS=true`. In PowerShell: `$env:NEXT_PUBLIC_FIREBASE_EMULATORS='true'; npm run dev`. Remove that shell override before a production build. The emulator mode uses project `demo-vihar`, a fake API key and a separate local Auth persistence key; it rejects non-localhost deployment origins and never points at production data.

Auth listens on `127.0.0.1:9099`, Firestore on `127.0.0.1:8080`. Emulator verification/reset messages are available in terminal output. Do not run the rules suite while relying on a manual emulator session: it clears the demo Firestore database between tests. Browser QA scripts, synthetic account details, screenshots and Java runtime downloads live under ignored `output/`; `.env.local`, `.firebase` and emulator logs must remain ignored.

## Change history

### Into the Vihar World hero and preview — 2026-11-01

Author: Codex, at the owner's request to adapt the supplied perspective tunnel and then make its many images pass over the text. The homepage now opens with **Into the Vihar world.** Nine cards follow the reference's golden-angle spiral, staggered depth, rotation and fade. The heading sits behind the images; the catalogue/play actions remain above them. The indigo atmosphere, bold uppercase lettering and local game artwork make the introduction a journey into Vihar's games.

The same hero remains testable at `/preview/vihar-world`, with noindex/nofollow metadata and no sitemap entry. The remaining homepage sections are shared without content changes through `src/components/home-content.tsx`. The old courtyard hero markup, image preloads and unused hero CSS are removed from the homepage.

The reusable component and scoped stylesheet are in `src/components/ui/perspective-tunnel-hero.tsx` and `perspective-tunnel-hero.module.css`. The existing component alias, TypeScript, Tailwind and `motion/react` support the integration without a second Framer Motion dependency. Nine optimized local images cover concept art, actual gameplay, world/vehicle renders, illustrations and the playable map, with accurate captions and links. All nine appear on phones as well as desktops.

Native scrolling advances the corridor and continues into the games. Pointer movement adds desktop parallax; touch, keyboard and section links retain normal navigation. Short windows and enlarged text use natural page scrolling. Pause/resume, live reduced-motion preferences, visible keyboard focus and a usable catalogue link without JavaScript are preserved. The copy wrapper does not create a stacking context, so images can overlap the animated heading while the actions stay clickable.

Next.js 16.4.3's bundled guides were consulted. The graph CSS strategy separates route styles from the shared shell. HTTP verification now checks the nine-card homepage and noindex preview, locally sourced responsive images, negotiated AVIF/WebP formats, cache headers and source proportions. The former 25 KiB single-image budget is replaced by a **128 KiB aggregate budget for nine mobile card images**. The animated hero adds its scoped stylesheet; homepage CSS measures **41,228 bytes** against an updated **42 KiB uncompressed limit**, with obsolete hero rules removed.

Validation on Node.js 22.23.4: `npm run check` passed, including lint, ten existing AdSense/account tests, type checking and the production build. Final build and `npm run verify` passed. Browser checks covered 1440×900, 1280×632, 768×500, 844×390, 390×844 and 320×740: nine cards at distinct depths in front of the heading, no horizontal overflow or nested scrolling, and reachable actions. Native scrolling, parallax, pause/resume, the Featured jump, all 35 desktop/phone keyboard focus steps, live reduced-motion changes, forced colours, 150% text at three widths and navigation with JavaScript disabled passed. Axe reported no WCAG A/AA violations at desktop/phone widths and there were no uncaught browser errors. Screenshots were visually reviewed, including the phone heading line breaks. Scripts, JSON results and images are in ignored `output/playwright/vihar-hero-*` and `vihar-world-*` files; these are local production-build checks.

The owner explicitly requested a GitHub push for production after the revision. Production publication uses the repository's existing GitHub/Vercel connection. The local production-mode preview is `http://localhost:3000/preview/vihar-world`; the owned process record is in `output/playwright/hero-preview-process.json`. If stopped, use the Node.js version in `.nvmrc` to build, then run `npm run start -- --hostname 127.0.0.1 --port 3000`.

### Share the portrait ID as a photo — 2026-11-01

Author: Codex, at the owner's request after reviewing the WhatsApp screenshots. Replaced the wide social banner with the standalone 900 × 1200 portrait card, declared its actual dimensions in Open Graph metadata, and versioned its image URL. Added a native sharing dialog with the full card, photo sharing, download and copy-link actions. File sharing starts directly on a user tap after preparation; cancel, download-only browsers, clipboard failure, retry and modal cleanup are handled. Native sharing hands the image to the selected app without automatically sending a message. Public profile reads, account permissions and game stats are unchanged.

The dialog styles load with the existing player theme. Tailwind source discovery is explicitly rooted at `src/`, keeping temporary verification files and surrounding workspaces out of generated utility CSS.

Validation: lint, all 10 existing tests, type checking, the final production build and `npm run verify` passed, including the homepage CSS budget. The sharing dialog passed layout and axe checks at 1440 × 900, 390 × 844, 320 × 740 and 844 × 390, with no horizontal overflow or page errors. A controlled Web Share stub confirmed a real 900 × 1200 PNG file, its filename, the profile link and active user activation at handoff; no message was sent to an external app. Cancellation, sharing failure, unsupported file sharing, download, clipboard success/fallback, retry, Escape, focus restoration and object URL cleanup passed. Read-only checks of the real `mrtg1b` profile confirmed portrait dimensions and PNG metadata in the head for WhatsApp, Twitterbot and Facebook crawlers. The legacy preview URL also returns the portrait, and the download response uses an attachment disposition.

### Dark player screens, activity calendar, onboarding and personal cards — 2026-11-01

Author: Codex, at the owner's request. Added a charcoal/off-white player theme with restrained amber accents and sans-serif headings across the dashboard, game library, friends, settings, public profiles and their loading/error states. The surrounding header/footer follows the player theme. Server-rendered route markers and dark viewport metadata keep the style scoped through client navigation; the public catalogue and login retain their existing appearance. Theme styles are in `src/app/player-theme.css` and the dashboard/profile layouts.

Integrated the supplied activity heatmap under `src/components/ui/`, added its missing CSS/motion utilities and the `motion` dependency, and connected a new `PlayActivity` section to optional daily game records. It supports 90-day/year ranges, pointer/keyboard date selection, moving tooltips, a pinned level legend, reduced motion and horizontal browsing on phones. The visible scroll container triggers the entrance animation so a year-wide chart is not left invisible on narrow screens. Calendar aggregation has focused tests for multiple games, leap days, legacy stats and malformed data. Random demo activity is not shipped or written to production.

Rebuilt onboarding as two steps (identity, then avatar) within the available viewport. A live card on the left updates with the player's name, username and avatar; phones use a compact preview above the current step. Back retains the entered data, username claims remain atomic, and successful creation restores normal dashboard scrolling. Small landscape windows retain keyboard/touch access through the form without an outer scrollbar. The dedicated stylesheet is imported after the common account/theme styles to preserve production CSS order.

Added individual vertical card downloads and server-generated social preview images, using only public profile fields and the existing avatar catalogue. Profile metadata now identifies the player and supplies their card to sharing crawlers. The route's bundled assets are listed in `next.config.ts`. Existing Firebase rules and separate game deployments are unchanged.

Validation: the isolated release passed `npm run check` (lint, 10 tests, type checking and production build), followed by a production build with emulators disabled and `npm run verify` (11 public routes and nine account routes, assets, metadata, links and hosting policies). Dashboard/profile browser checks passed at desktop, phone and short landscape sizes across 20 cases, with no horizontal overflow, page errors or reported axe violations. Both onboarding steps passed 12 viewport cases; live preview, reserved usernames, Back retention and successful profile creation were verified. Creation restores the footer and normal dashboard scrolling, with an empty activity history for a new account. Heatmap checks covered actual daily totals, keyboard navigation, range changes, pinned legend dismissal and reduced motion. Read-only checks of the real `mrtg1b` profile confirmed the 900 × 1200 card, 1200 × 630 preview and personalized image metadata in the head for WhatsApp, Twitterbot and Facebook crawlers. The deployment trace includes all six avatars and the emblem. `npm audit --omit=dev` reported zero vulnerabilities.

### Fit the login page into one viewport — 2026-11-01

Author: Codex, at the owner's request. `/login` now fills the space below the header in one viewport, with its site footer and visible scrollbars removed. The two-column composition, heading, spacing and player card adapt to the available height. Normal laptop/phone sizes display the complete sign-in form without scrolling. Very short landscape windows retain wheel, touch and keyboard access inside the form without an outer page scrollbar; a failed-login message is brought into view automatically. The page marker scopes these styles even when Next retains CSS during client navigation, so other pages restore their normal footer and scrolling. Changes are limited to the login wrapper/styles, the login heading/error presentation in the shared form, and this record.

Validation: `npm run check` and `npm run verify` passed on Node 22, including the production build and all 20 public/account routes. Production browser checks covered 1920×1080, 1440×900, 1280×632, 1280×599, 768×600, 390×844, 320×740 and 844×390. All had no outer page overflow or visible footer/scrollbar; the seven taller cases showed every sign-in control without form scrolling, and the short landscape case retained keyboard access to the bottom of the form. Mobile menu navigation, browser Back, signup layout restoration, password visibility and a mocked failed-login response passed. Axe found no main-content violations at desktop and phone sizes. Screenshots and scripts are in ignored `output/playwright/login-viewport-*`.

### Vihar ID accounts, profiles and friends — 2026-11-01

Author: Codex, at the owner's request. Added an optional Firebase account layer with Google/email sign-in, unique atomic username claims, six selectable avatars, public shareable profiles, private saved games, mutual friend requests, dashboard statistics, profile settings, email verification, password recovery, provider linking and data export. The owner requested a more mature gaming identity during review; the final assets are the six geometric gamer portraits documented above, with graphite player cards and more direct account copy. Public pages retain the existing Vihar design. Independent game repositories were not changed, and game statistics remain explicitly pending their future integration.

Added the account routes/components, lazy Firebase client, typed data access, restrictive Firestore/Storage rules, emulator tests, Java 21 rules CI, public environment template, updated privacy/terms/FAQ, header/footer/home account links, and HTTP checks for all new routes and assets. Private service-account credentials are not required for this release and are not committed. Firebase configuration is supplied through ignored local settings and Vercel build variables; Analytics remains off. Security rules keep email out of public profiles, isolate favorites and friend relationships, make usernames immutable and deny all client score writes. The auth state preserves forms on token refresh and clears account state when the UID changes.

Validation on Node 22: `npm run check` passed strict lint, eight configuration/model tests, type checking and the production build. `npm run test:rules` passed all 14 authorization tests using Firestore Emulator and Java 21, including simultaneous username claims and reciprocal friendship writes. `npm run verify` passed all 11 existing public routes, nine noindex/ad-free account/profile routes, six avatar assets, existing metadata/link/image checks and homepage budgets. `npm audit --omit=dev` reported zero vulnerabilities. Existing AVIF passthrough and Node test-module notices remain non-failing.

Real-browser QA used isolated Firebase emulators and synthetic accounts. Passing flows include Google popup sign-in, email registration, reserved/taken usernames, profile/avatar edits, reload persistence, private favorites, public sharing and email privacy, email verification on a fresh full-page load, friend send/accept/cancel/decline/remove, password creation on a Google account with the same UID, password reset, account export without tokens, and sign-out/account isolation. Final accessibility/responsive checks passed 37 page/viewport cases across 1440×900, 390×844, 320×740 and 844×390, with no horizontal overflow and no axe violations in main content. Login, onboarding, dashboard and phone profiles were visually reviewed. Evidence is in ignored `output/playwright/vihar-id-*`; test accounts were confined to `demo-vihar`.

The owner confirmed Google/email providers, production authorized domains and Firestore rule publication. Live read-only probes confirmed the domains and expected public/private Firestore access behavior. The authorized GitHub push deployed application commit `6f655c8` successfully through Vercel. Live browser checks on `www.vihar.online` confirmed the configured Firebase email endpoint returns the expected generic error for a nonexistent synthetic login, Google opens `accounts.google.com`, a missing public profile resolves correctly through Firestore, and the redesigned avatar asset is served. Login/signup screens load and the Vercel Firebase variables are active. No production test accounts or profiles were created. These are production configuration/smoke checks; completed account and friendship flows were exercised in isolated emulators.

The first GitHub run exposed a timing assumption in the adversarial reciprocal-write test: Firestore may reject both concurrent raw writes when their rule reads conflict. The test now verifies at most one successful write, no records from rejected writes, a successful retry when both abort, and rejection of a reverse duplicate after a connection exists. The deployed rules and application behavior are unchanged. The added Java setup action uses v5 following the runner's v4 deprecation notice.

### Remove section scrollbars and visible breadcrumbs — 2026-11-01

Author: Codex, at the owner's request to fix the clipped Bap Ka Rasta hero, remove the Home / Games / current-page breadcrumb row everywhere, keep desktop sections sized to one screen without internal scrollbars, and push the changes to GitHub. Base commit: 84582f6.

Desktop sections and page introductions now use the available screen height as a minimum. Their content participates in document flow, so narrow windows, enlarged text and expanded FAQ answers stay readable without nested vertical scrolling. This supersedes the earlier fixed-height / internal-scroll behavior; normal desktop panels still fill a screen. The homepage hero and featured copy no longer create their own scroll containers.

The game hero uses the full height below the header, with compact spacing for short desktop windows and a natural artwork/copy stack on phones. Its status badge, launch action and footnote stay inside the hero, and the artwork is positioned to retain the foreground vehicles. Visible breadcrumbs and their reserved height/styles are removed from every route. Inner-page CSS still loads through PageIntro or explicit route imports, preserving the homepage CSS budget. Section jumps rely on the shared header scroll padding without adding a second header offset. The Controls jump targets the whole panel so its numbered heading remains visible. Main navigation, gallery filters, the image viewer and structured-data breadcrumbs remain available.

Validation on Node 22.23.4: `npm run check` and `npm run verify` passed, including strict lint, all four existing configuration tests, TypeScript, the production build, all 11 public routes and the existing homepage asset/CSS budgets. Production browser checks passed 55 page/viewport combinations at 1440×900, 1280×599, 768×500, 390×844 and 320×740: no visible breadcrumbs, nested vertical scrolling, horizontally overflowing pages or clipped text. Desktop panels fit the available screen at 1440×900 and 1280×599; small windows and expanded content retain natural page scrolling. The hero stayed unclipped at 150% text size in four desktop/phone sizes, and opening every Help answer created no nested scroller. All five game section jumps and the home feature/FAQ and guide contents links aligned below the header. The six vehicle previews, gallery filters, viewer keyboard/Escape/focus restoration, Back-to-game navigation, reduced motion and forced colours passed; Axe reported no violations in the game page, gallery or open viewer at the checked desktop/phone sizes. Final screenshots were visually reviewed. Scripts, JSON results and previews are in ignored `output/playwright/bkr-scroll-*` and `bkr-final-*`. These are local production checks; the owner authorized the GitHub push.

### Bap Ka Rasta visual game page and gallery — 2026-11-01

Replaced the long game-detail story and build-note sections with a large illustrated game banner, an interactive six-ride garage, a five-city image grid, four actual character-model portraits, a three-image gameplay collage, and a compact controls/device panel. The page uses bold DM Sans headings, charcoal and warm yellow alongside the existing Vihar canvas and navigation. Desktop panels retain the one-screen layout; phone panels have natural heights. The first-drive guide remains the destination for detailed instructions.

The gallery now contains 27 images: three gameplay captures, the playable road map, five city concepts, four world/landmark renders, six vehicle concepts, and eight actual character-model portraits. Category filters and a native-dialog image viewer support keyboard navigation, previous/next, Escape, focus restoration, and full-size links. Images remain accessible as ordinary links without JavaScript. ImageGallery data and the image sitemap include every gallery image; VideoGame screenshots remain the actual gameplay captures/map. The game itself is never embedded or preloaded.

Playable availability was checked against the current `Game 1/src/selection/Selection.tsx` and `Game 1/docs/Mumbai-Playable.md`: Mumbai and the auto are playable; Delhi, Kolkata, Chennai, Bangalore, Thar, Fortuner, Scooty, KTM and Toto remain previews. The gallery and detail cards label these accurately. Character names and artwork match the game's cast and model renders.

New source copies from the owner's `D:\Personal Project\Game 1` checkout are preserved under `assets/original/`: `public/images/vehicle-gallery.webp` → `bap-ka-rasta-vehicle-gallery.webp`; `public/images/world-board.webp` → `bap-ka-rasta-world-board.webp`; `public/images/toto-erickshaw.png` → `bap-ka-rasta-toto.png`; `docs/mumbai-characters/renders/main-cast.jpg` → `bap-ka-rasta-main-cast.jpg`; `docs/mumbai-landmarks/landmark-library.jpg` → `bap-ka-rasta-landmarks.jpg`; `docs/mumbai-landmarks/street-scale.jpg` → `bap-ka-rasta-street-scale.jpg`. Existing gameplay originals are retained. `scripts/generate-game-showcase.mjs` crops these sources into 23 WebP images totalling approximately 462 KiB; `npm run assets` includes this step. Runtime assets are self-contained in this repository, without a dependency on the separate game checkout. The game checkout was not modified.

Validation on Node 22.23.4: `npm run check` and `npm run verify` passed, including strict lint, four existing configuration tests, TypeScript, production build, all 11 public pages, the 27-image gallery/schema/sitemap, internal links, and existing homepage image/CSS budgets. Production layout checks covered 1440×900, 1280×632, 768×500, 390×844 and 320×740: no horizontal overflow, overlapping panels or broken visible images; normal desktop panels fit their allocated screen, and short windows retain scroll access. All six vehicle previews, keyboard selection, future-vehicle launch restrictions, all five gallery filters, viewer arrow keys/previous/Escape/focus restoration, Back-to-game navigation, reduced motion and forced colours passed. Axe found no violations in either updated page at desktop/phone widths or in the open viewer. The browser requested no game-origin assets and reported no uncaught errors. Desktop/phone screenshots were visually reviewed; scripts and screenshots are in ignored `output/playwright/bkr-*`. The owner authorized a GitHub push after the updates; these checks are local production checks, not a claim of completed hosting deployment.

### Image cards and category browsing — 2026-11-01

The home collection and Games page now share full-image cards, with a title, short description, two quiet category labels, and one link covering the entire card. Availability and concept-art labels remain visible. The original artwork, warm canvas, serif typography and restrained hover effects are retained. Cards stack on phones; the category row scrolls horizontally. The home collection fits the usual desktop panel sizes, with scroll access retained in short windows.

Added a shared category registry in `src/lib/game-categories.ts`: Arcade, Free roam, Teamwork, Simulation and Solo. Homepage links and the Bap Ka Rasta detail links open the matching filtered collection. Games receive typed category IDs in `src/lib/games.ts`; the first two appear on their cards. Bap Ka Rasta is tagged for free roam, solo, arcade and simulation. Gulam Chor remains an upcoming announcement without invented gameplay or player-mode categories. Empty categories have a simple, honest empty state.

The Games page has a compact introduction, category selection, search, an availability filter, and Featured / Name A–Z / Name Z–A / Playable first sorting. Search matches words across titles, genres, descriptions, platforms and category labels. Result counts, clear-search and reset controls keep recovery straightforward. Validated URL parameters retain filters on reload and shared links; category/filter/sort changes support Back and Forward. A Suspense fallback preserves the complete static card list and usable game links before JavaScript loads. Only the first visible catalogue card loads eagerly; the homepage preview remains lazy.

Validation with Node 22.23.4: `npm run check` and `npm run verify` passed, including all 11 public routes and the existing metadata, asset and homepage CSS budgets. Production browser checks passed 16 search/filter/sort/history cases, including fast typing and the literal search term `all`, plus 13 keyboard, navigation, reduced-motion, forced-colors and JavaScript-disabled checks. Both updated pages passed layout checks at 1440×900, 1280×632, 768×500, 844×390, 390×844 and 320×740, with no horizontal overflow or clipped card text. Axe found no violations in the main content of Home, Games and Bap Ka Rasta at desktop and phone widths. Desktop and phone screenshots were visually reviewed. Browser scripts, results and previews are in ignored `output/playwright/catalogue-*` and `output/playwright/collection-*` files. These checks were run locally. The owner authorized committing and pushing this change to GitHub on 1 November 2026; deployment verification remains separate. The existing AVIF passthrough build notices remain.

### Fit desktop sections, reset page navigation and improve image discovery — 2026-10-31

The owner corrected the coming-soon game name to **Gulam Chor**. The catalogue, page, FAQ, supporting copy and sharing image use that name, with canonical path `/games/gulam-chor`. The previous page and image URLs permanently redirect to their renamed destinations. Its development status and noindex policy are unchanged.

The owner asked for one-screen sections and hero introductions, with taller sections allowed on phones, and reported Search Console's “Discovered – currently not indexed” status. Desktop panels now use the viewport space below the sticky header, with compact artwork and spacing. Short windows and enlarged text retain scroll access to overflowing content. Phone layouts keep natural heights. Page changes start at the introduction and focus main content; same-page contents/FAQ links retain fragment navigation. Cross-page links omit fragments, including links across the guide's full-document advertising boundary.

Added `/games/bap-ka-rasta/screenshots`: four visible, captioned images with descriptive alt text, full-size links, ImageGallery/ImageObject data, links from the game page and guide, and entries in the Next.js image sitemap. VideoGame data also references the screenshots. Source captures are copied unchanged from the owner's game checkout: `output/playwright/mumbai-voices-driving.png` → `assets/original/bap-ka-rasta-seafront.png`; `output/playwright/mumbai-dialogue-1280x800.png` → `assets/original/bap-ka-rasta-conversation.png`; `docs/maps/mumbai-game-map.png` → `assets/original/bap-ka-rasta-mumbai-map.png`. The existing driver-camera capture is reused. WebP copies are reproducible with `npm run assets`; the fictional road-network map is explicitly distinguished from real Mumbai navigation.

Live inspection found no robots/noindex/canonical block on the main website: apex redirects to www and completed pages have crawlable HTML. The separate game still identified its old Vercel domain and returned an empty application root. The paired Game 1 changes correct its canonical, social, structured-data and sitemap references to `https://rasta.vihar.online`, and prerender the existing landing component during the Vite build for browser hydration. Gameplay remains client-rendered. These fixes improve crawlability and consistency; they do not establish why Google deferred the main site's crawl.

After both projects are published, verify the live HTML and image sitemaps, submit `https://www.vihar.online/sitemap.xml` and `https://rasta.vihar.online/sitemap.xml` in the relevant Search Console property, and use URL Inspection → Test live URL → Request indexing for the homepage, game page, gallery and game origin. Do not repeatedly request the same URL. Google documents that crawling can take days to weeks and submission does not guarantee inclusion. “Discovered” means Google knows the URL but has not crawled it; code cannot force indexing. The Search Console account actions and an actual indexed result remain external work.

References: [Google crawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [image guidance](https://developers.google.com/search/docs/appearance/google-images), [image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Validation: strict lint, all four advertising-configuration tests, TypeScript, production build and the extended HTTP verifier passed. The verifier covers all 11 public pages, visible gallery image markup, structured data, decoded sitemap images, renamed-page/image 308 redirects and absence of the old game name. Browser checks covered 55 page/viewport combinations (1280×632, 1440×900, 768×500, 390×844 and 320×740): no horizontal overflow, broken completed images or clipped starts; every desktop main panel matches its viewport allocation, and the normal desktop sizes need no internal overflow. Short desktop windows keep overflow scrollable, and phone sections keep natural height. Navigation checks passed for footer links, Back, same-page FAQ/contents anchors, cross-page control links, both directions across the guide document boundary, Gulam Chor search/navigation and the phone menu, with no uncaught page errors. Final screenshots and browser result files are in ignored `output/playwright/`.

The paired game work passed its build, all 81 unit tests and all 25 existing/new Playwright browser tests in Chrome. Initial HTML and JavaScript-disabled checks expose its heading and image; hydration still opens city selection. Its social artwork now displays the production domain. The code is verified locally; deployment and Search Console actions are not yet completed. Existing framework notices remain: Next passes pre-encoded AVIF imports through unchanged, and Vite reports the already-separated gameplay chunk above its default size warning.

Final local Lighthouse 13.6.0 mobile check: Performance 94; Accessibility, Best Practices, SEO and Agentic Browsing 100. FCP 0.9 s, LCP 3.2 s, TBT 40 ms, CLS 0, Speed Index 0.9 s. This is a single local simulated run, not the deployed site's score; LCP remains above 2.5 s in that simulation. Report: `output/playwright/layout-final-lighthouse.report.{json,html}`.

### Reduce homepage first-load work — 2026-10-31

Author: Codex, following the owner's mobile Lighthouse report (94 Performance, other scored categories 100). Base commit: edae875. Changes are local; this task did not push or deploy the site.

Changes:

- Split the stylesheet into shared `globals.css`, homepage `home.css`, and inner-page `content.css`. The latter loads through Breadcrumbs / PageIntro, which every current inner page uses. All 518 original selector/declaration/media-condition combinations were preserved. Initial homepage CSS is 25,658 bytes uncompressed, down from 40,860 bytes. New inner-page components must keep the content stylesheet dependency.
- Prebuild the courtyard at 480, 768 and 1100 pixels in AVIF and WebP through `npm run assets`. The native picture element selects the appropriate source, retains fixed dimensions and alternative text, and uses a matching AVIF preload with high priority. Static imports give these assets hashed, immutable URLs. Mobile AVIF is 18,631 bytes, down from the previous optimized image's 25,750 bytes, and needs no request-time image conversion. Other images still use Next Image. The original artwork and source assets remain available.
- Preload the local Newsreader faces to remove their stylesheet-discovery delay. Keep font-display swap. Disable speculative Next Link prefetching so other routes and catalogue code load on navigation. Client routing and the guide's full-document advertising boundaries are preserved.
- Extend the HTTP verifier to decode all six hero variants, check actual dimensions, MIME types and immutable caching, and guard a 25 KiB mobile AVIF budget and 32 KiB uncompressed homepage CSS budget.

Validation: strict ESLint, the four AdSense configuration tests, TypeScript and production build passed. The production HTTP verifier passed all ten public routes and the new asset/CSS budgets. Browser checks passed at 320, 390, 844 landscape and 1440 pixels: keyboard skip link, mobile menu/Escape focus, client navigation, filters/search/reset, guide entry/exit document boundaries, FAQs, image decoding, overflow, reduced motion and absence of advertising requests/uncaught errors. Homepage text and layout above the artwork were pixel-identical to the baseline; desktop and mobile artwork were visually reviewed. All current CSS declarations and responsive conditions were compared to HEAD programmatically. Reports and screenshots are in ignored `output/playwright/`.

Measured with Lighthouse 13.6.0, Chrome 156, production localhost, default simulated mobile Slow 4G and 4x CPU slowdown. The local pre-change baseline scored 89. Three final runs scored **92, 93, 92**; Accessibility, Best Practices, SEO and Agentic Browsing were **100** in each. Median final FCP was about 0.9 s, LCP 3.2 s, TBT 80 ms, CLS 0 and Speed Index 0.9 s. The single baseline was FCP 0.9 s, LCP 3.4 s, TBT 180 ms, CLS 0 and Speed Index 0.9 s. The render-blocking estimate fell from 168 ms to 40–110 ms across the final runs; total transferred resources fell by approximately 29 KB in the representative comparison. These local scores are not directly comparable to the owner's hosted 94 or a guarantee of a deployed score. The retained final reports are `performance-cacheable-css-v13.report.{json,html}` and the corresponding `-2` and `-3` files; baseline is `performance-before-v13.report.{json,html}`.

Limits: LCP remains above 2.5 s in this local simulation. Next.js/React's shared runtime still triggers legacy-JavaScript (14 KiB estimated) and unused-JavaScript diagnostics. The unused estimate varies with coverage and can increase when speculative work is removed even though less JavaScript is downloaded; no framework code or browser compatibility guards were stripped to hide the audit. Full CSS inlining was tested and removed after it duplicated styles in HTML/RSC payloads without a reliable score gain. The cacheable split stylesheets retain a small blocking request. Turbopack emits three warnings that imported AVIFs are passed through without optimization/encoding; this is intentional for pre-encoded assets, and their emitted responses, caching and decoding were verified. Deployment and a fresh hosted Lighthouse audit remain necessary to measure the production outcome.

### Address AdSense policy risks and prepare a reviewable site — 2026-10-31

Author: Codex, at the owner's request to investigate the rejection, consult Google policies online, fix the site and push to GitHub. Base commit: 701c3c6. See the policy findings and account steps above; Google did not disclose a specific rejection reason.

Changes: replaced the all-page loader with review-mode defaults and independent approval/consent/serving gates; preserved publisher verification and ads.txt. Restricted future loading to a completed, source-linked first-drive guide. Added full-document link boundaries for advertising pages and recovery from a hydrated page error. Corrected cookie/vendor disclosures and added a Google consent-reopening control for enabled mode. Added the guide to normal navigation and the sitemap; excluded the unfinished announcement from indexing while keeping it accessible. No game engine, new dependencies, publisher ID, domain, or Git history was changed. Automated CI now covers review, enabled and preview builds.

Validation on Windows with Node 22.23.4: strict ESLint passed; all four configuration/policy tests passed, including legacy enabled-only configuration, each missing readiness flag, preview override, malformed publisher values and excluded routes. TypeScript and production builds passed. The HTTP verifier passed all ten pages, internal links and assets, sitemap/indexing, metadata, publisher declaration, guide content, privacy wording, exact script placement/count, query URLs and three missing-page cases in review, enabled and preview modes. Restored and verified the default review-mode build last. Node emits a harmless module-type inference warning for the source TypeScript test imports; no test fails.

Browser validation: visually checked the guide on desktop and phone; no horizontal overflow or broken loaded images at 320, 390 and 1440 px. Review mode requested no Google advertising. Enabled mode used a mocked Google script only: verified the single loader, consent-reopening callback, complete removal of the mock ad/script across document navigation, search empty state, back/forward, mobile Help navigation, legal/upcoming pages and nested 404s, with no uncaught page errors. With the Google request blocked, the guide remained readable and the game launch link remained usable. Expected HTTP 404 console entries were produced by missing-page tests. Screenshots and local browser audit scripts remain in ignored output/playwright/. The separate live game was opened through its actual selection/start screens to 3D gameplay, confirming the guide's launch flow and displayed gear limits; this was not a physical-phone performance audit.

Remaining external steps: production deployment/readback after the authorized push, an AdSense re-review, and actual account approval plus certified consent/placement verification before enabling ads. Neither the code tests nor the new guide guarantee approval. The authenticated review request and account settings were not changed.

### Install the supplied AdSense Auto ads head snippet — 2026-10-31 10:37:41 IST (UTC+05:30)

Author: Codex. The owner supplied Google's async script and requested placing it between head tags across the site. Enabled the loader by default and moved it from a deferred Next Script in the body to a native async script in the shared root head. Publisher ID and crossorigin=anonymous match the provided snippet. Previews still omit the script; ADSENSE_ENABLED=false remains an explicit off switch. Privacy disclosures already adapt to enabled mode. Updated configuration examples and verification to require exactly one matching async head script on each of the nine public routes, plus absence in preview/disabled mode. No Google account configuration or approval status is changed by this code.

Validation: npm run check passed (lint, TypeScript and production build). Production HTTP verification passed in default enabled mode, VERCEL_ENV=preview, and ADSENSE_ENABLED=false; each build was tested with matching environment values. Restored and verified the default enabled production build last. Checks cover one async head script on all nine pages, publisher/crossorigin attributes, preview/off suppression, matching privacy text, ads.txt and the existing site checks. git diff --check passed. Push to main continues the owner's authorized GitHub delivery workflow. Live ad delivery and AdSense approval remain Google-controlled and were not verified.


### Make FAQs visible on the homepage — 2026-10-31 03:23:01 IST (UTC+05:30)

Author: Codex. The owner could not find the FAQs and requested a correction and GitHub push. Previously the new answers were only on /help.

- Added a clearly titled Frequently asked questions section at /#faqs, before the closing homepage action, with a responsive two-column desktop / one-column mobile layout. The first answer is open on initial load; every answer uses native keyboard-accessible details/summary controls and works without JavaScript.
- Added FAQs links in desktop navigation, mobile navigation and the footer. The homepage section links to all Help questions and troubleshooting. Both pages use the same factual answer source.
- Kept FAQPage structured data on /help only to avoid repeating the same marked-up FAQ across pages. Removed a redundant homepage WebSite entity; the stable identified WebSite entity remains.
- Extended production verification to require the homepage FAQ anchor, heading, navigation link, initially open answer and all shared question/answer text.
- Validation: npm run check and npm run verify passed under Node.js 22, including the new homepage FAQ assertions; git diff --check passed. Push is explicitly authorized; deployment success remains separate from the push.


### Logo fidelity, discovery and AdSense review — 2026-10-31 03:12:32 IST (UTC+05:30)

Author: Codex, at the owner's request. Base GitHub commit: 4e893e0784e03211886e45f88dd25780a36bc174.

- Replaced the redrawn favicon with a square crop of the actual emblem in root logo.png: left 584, top 160, width/height 368. Preserve pixels, dot, shape and aspect ratio; exclude presentation text and sample icons. Regenerate ICO, PNG, Apple and manifest icons through npm run assets. Removed the competing public/icon.svg so browsers cannot prefer the old shape. Other header/vector branding is unchanged.
- Improved the homepage search title/description with truthful browser-game and Mumbai auto-rickshaw terms. Added a WebSite entity and visible discovery FAQs with matching FAQPage structured data. Existing canonicals, per-page metadata, sitemap and production/preview robots policy remain authoritative.
- Added optional Search Console verification, factual /llms.txt, validated AdSense config, account verification metadata, /ads.txt and a separately gated script. Updated privacy disclosures for review-only and enabled modes. Game content never depends on advertising availability.
- Consolidated deployment, verification and asset documentation into this file. Removed duplicate documents after preserving their content below, and shortened README. Retained the owner brief, original source artwork, font licences, lockfile and all runtime assets because they are needed for provenance or reproducibility.
- Tests: passed; see the dated validation entry below.
- No GitHub push, Vercel deployment, domain changes or account-setting changes are part of this local edit.

### GitHub publication authorized — 2026-10-31 03:16:45 IST (UTC+05:30)

Author: Codex. The owner explicitly requested committing and pushing all prepared changes to GitHub. Their AdSense screenshot shows vihar.online as Getting ready and ads.txt as Not found. The /ads.txt route supplies `google.com, pub-6693217545827146, DIRECT, f08c47fec0942fa0` in production. Keep ad serving disabled while review is pending. Fetch confirmed origin/main still matches base 4e893e0, with no remote changes to merge. Push this change to main for the connected Vercel build; a Git push alone does not establish deployment success or AdSense approval. After deployment, verify https://www.vihar.online/ads.txt and allow Google to recrawl it. This supersedes the earlier local-only delivery status, not its validation evidence.

## Current validation — 2026-10-31 03:15:24 IST (UTC+05:30)

Author: Codex. Executed on Linux with Node.js 22.23.4 using the existing lockfile.

- npm ci completed; npm reported upstream ESLint peer-range warnings, but installation and strict lint succeeded. No dependency versions or lockfile were changed.
- npm run assets completed. Visually inspected the original logo and generated 192px icon. The automated 48px icon comparison proves pixels match a proportional resize of the source crop. Unrelated platform-dependent re-encodes of social artwork were discarded.
- npm run check passed (zero-warning lint, route type generation, TypeScript, production build).
- npm run verify passed: nine public pages, unique metadata, normalized canonical links, JSON-LD, local links, committed images/fonts/icons, sitemap, robots, manifest, launch/contact links, headers, 404, matching visible FAQs, original-logo icon, ads.txt and llms.txt.
- Built and verified ADSENSE_ENABLED=true: standard loader is present, publisher metadata/declaration match the owner's ID, and privacy text reflects enabled mode. This checks rendered HTML; it does not contact Google, request ads, or validate account approval.
- Built and verified VERCEL_ENV=preview with ADSENSE_ENABLED=true: no ad loader or publisher declaration, plus noindex/disallow robots behavior.
- Rebuilt and reran checks in default review-only mode last. git diff --check passed. No deployment or push performed. Live browser ad delivery, CMP configuration and Search Console ownership/submission were not tested.

## Historical reference (preserved from the previous commit)

The sections below record earlier work, not freshly executed tests. Their claims about no advertising and redrawn favicons are superseded by Current configuration and the change history above. Historical screenshots/Lighthouse values were reported by that implementation and are not new measurements.


### Archived source: docs/deployment.md

# Deploying Vihar

## Project settings

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

## Domain and email

1. Keep **www.vihar.online** as the catalogue’s canonical domain.
2. Keep **vihar.online** redirected to **www.vihar.online**. The live setup returns HTTP 308 for this redirect.
3. For a fresh domain configuration, add both hostnames to the catalogue project and use the **exact DNS records shown by Vercel**. Wait for domain validation and HTTPS.
4. Leave **rasta.vihar.online** attached to the independent Bap Ka Rasta project.
5. Confirm **contact@vihar.online** can receive and reply to email through the owner’s mail provider. Web hosting does not create the mailbox or its MX records.

The owner confirmed the mailbox address and game hostname. Both the catalogue and game were reached over HTTPS on 31 October 2026; the game was also opened through to gameplay during implementation. No DNS or email-provider settings were changed by this work.

The brief proposed the apex domain as canonical. The implementation follows the existing live **www** redirect instead, so search engines receive a consistent final address. To switch to the apex domain later, reverse the Vercel redirect and change SITE_URL together, then redeploy.

## Environment

Defaults are suitable for the intended production domain:

~~~dotenv
SITE_URL=https://www.vihar.online
BAP_KA_RASTA_URL=https://rasta.vihar.online
SUPPORT_EMAIL=contact@vihar.online
~~~

These values are public configuration, not secrets. SITE_URL must be an HTTPS origin without a path, query, credentials, or fragment. The game URL must use HTTPS. Invalid values fail the build. Changes require a new build because pages are prerendered.

Vercel supplies VERCEL_ENV automatically. **Preview** builds emit noindex/nofollow metadata and disallow crawling in robots.txt. Keep the canonical origin set to the intended public domain, rather than a temporary preview URL. Robots directives discourage indexing; they are not access control. Use Vercel deployment protection for private previews if needed.

## Before sharing the production address

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

## Search visibility

### Favicon and public discovery — 2 November 2026

The production homepage and public pages declare `/brand/icon-192.png` as their first favicon, a square 192px PNG derived from the owner's original emblem. `/favicon.ico` remains a stable fallback. Google's current [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) recommends an image larger than 48px, a stable URL, and access for both Googlebot and Googlebot-Image. A generic globe in Search Console does not establish whether a page is indexed.

`/site-map` provides ordinary HTML links to all public pages, including the honestly labelled upcoming announcement, the gallery, and the independent game's `/guide.html`. Every page links to this directory from the footer. The XML sitemap includes completed public pages and representative artwork, screenshots, logo and favicon images. Account pages and the unfinished announcement remain crawlable but carry their existing noindex metadata; preview builds retain their existing crawl restrictions. `llms.txt` lists public resources but is not a Google indexing mechanism.

Live inspection before this change confirmed HTTP 200 for both canonical homepages, robots, sitemaps, ICO files and PNG icons, without blocking robots headers. The apex domain redirects to `www.vihar.online`; keep `SITE_URL=https://www.vihar.online` consistent with that redirect.

After deployment, submit both sitemaps in the matching Search Console domain properties:

- `https://www.vihar.online/sitemap.xml` under `vihar.online`.
- `https://rasta.vihar.online/sitemap.xml` under `rasta.vihar.online`.

Use URL Inspection → Test live URL → Request indexing for `https://www.vihar.online/` and `https://rasta.vihar.online/`, and inspect the new public directory and game guide. Google fetches the favicon from the homepage declaration; request indexing for the homepage rather than submitting the icon as a page. Recrawling may take days or weeks and favicon display is not guaranteed. These authenticated Search Console actions require the owner's account and are separate from the code changes and GitHub push.

Validation on Node.js 22.23.4: `npm run check` passed (lint, advertising/account tests, generated route types, TypeScript and production build); `npm run verify` passed across twelve public pages, nine noindex account pages, original-logo PNG pixels, all gallery/sitemap images, metadata and local links. Browser inspection without JavaScript confirmed all twelve directory links at desktop and phone widths, with no horizontal overflow. The independent game guide's five cities, six vehicles, twenty characters and twenty-nine landmarks also rendered without JavaScript; homepage-to-guide navigation and hydrated game selection passed without page errors.

After the custom domain is live, verify ownership in Google Search Console and submit:

~~~text
https://www.vihar.online/sitemap.xml
~~~

This requires access to the owner’s Search Console account and DNS or an approved verification method. The site does not invent a verification token. Indexing timing and search rankings are controlled by search engines, not guaranteed by the code.

The catalogue game page is canonical to **www.vihar.online/games/bap-ka-rasta**. The separate game project controls its own canonical metadata. If its page source still names a former deployment address, update that metadata in the game repository when maintaining it; this catalogue does not rewrite the game application.

## Performance and future integrations

Fonts are local. Newsreader includes only the 400 normal, 500 normal, and 400 italic faces the site uses; DM Sans remains variable. The smaller serif files load when used instead of competing with the hero through unconditional preloads. Images have reserved dimensions and responsive Next.js delivery. The hero loads eagerly with high priority; images below the fold load lazily. Only small navigation and catalogue controls require client-side state. The hero atmosphere is static and motion preferences are respected.

There are no advertising or analytics integrations to configure. If either is introduced, measure again with the real scripts and consent states. Follow the brief’s placement rules, disclose actual providers, and keep game launches independent from those services.

Local browser and Lighthouse results are in [verification history](#historical-reference-preserved-from-the-previous-commit). They are laboratory checks, not real-user Core Web Vitals or certification of every device.


### Archived source: docs/verification.md

# Vihar verification

Verified on **31 October 2026** using **Node.js 22.23.4**, Next.js 16.4.3, and Chrome 156 on Windows. Public pages are prerendered; game engines remain on their independent deployments.

## Production checks

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

## Chrome interaction and layout review

- All nine routes were checked at 320, 390, and 1440 px widths, plus 844 × 390 px landscape.
- The homepage was also reviewed at tablet widths. Images decoded successfully, and no horizontal document overflow was found.
- Keyboard checks covered the first-position skip link, focus transfer to main, mobile navigation, Escape closing and returning focus, route changes, and native Help accordions.
- Catalogue checks covered both availability filters, case-insensitive search, whitespace trimming, the empty state, clearing search, and resetting the collection.
- The coming-soon game has no launch action. Bap Ka Rasta links to its independent HTTPS address in an isolated new tab.
- Reduced-motion preferences disable smooth scrolling and transitions.
- No page errors, console errors, or failed catalogue requests were recorded during the interaction review.

Axe checked all nine pages at a mobile viewport against WCAG A/AA rules and accessibility best practices, including the label-in-name rule. **Zero violations were reported.** Manual keyboard and visual checks supplement this result; automated checks are not a full accessibility certification.

Review screenshots and local HTML/JSON Lighthouse reports are saved in output/playwright/, which is intentionally excluded from Git. The public sharing cards and game screenshots are committed production assets.

## Mobile performance

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

## Live hosting

The catalogue was reached over HTTPS at **www.vihar.online**. **vihar.online** returns HTTP 308 to that address, so the website's canonical origin and sitemap follow the existing www configuration. Bap Ka Rasta returned HTTP 200 over HTTPS at **rasta.vihar.online** and was opened through to gameplay during implementation.

The supplied support address is wired across Contact, Help, policies, and the footer. Sending and receiving email requires the owner's mailbox; no test email was sent.

For project settings, domain management, environment variables, and Search Console submission, see [deployment history](#historical-reference-preserved-from-the-previous-commit).


### Archived source: assets/README.md

# Vihar asset register

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

## Reproduction

With the Node.js version in `.nvmrc` and the locked dependencies installed:

~~~sh
npm run assets
~~~

The script copies licensed font files, writes the logo masters and editable original SVG illustrations, rasterizes WebP artwork, optimizes the saved game captures, and composes sharing cards. It does not contact a remote image generator or recapture the game.

Game captures can become outdated as the independent game changes. To refresh them, launch the current game in Chrome, capture actual third-person and driver-camera views at 1440 × 900, replace the two original PNGs, and run the asset command. Keep concept and gameplay labels accurate.

## Node.js 26 deployment alignment — 2026-11-02

Author: Codex. The owner's Vercel screenshot showed the repository's Node.js 22.x engine overriding the project's selected 26.x runtime. Set `package.json` to `engines.node: "26.x"` and `.nvmrc` to `26`, so Vercel, local development and both GitHub Actions jobs select the same major version. Updated `@types/node` to 26.x and regenerated `package-lock.json` with npm 11.20.0. Updated README and operational version instructions; historical validation records retain their original Node.js versions.

Validation used the official, SHA-256-verified Node.js 26.13.0 Windows distribution and npm 11.20.0. A clean `npm ci` passed. Strict lint, all ten AdSense/account tests and TypeScript checks passed. The first build attempt in `npm run check` encountered an existing Next.js build lock; after it cleared, `npm run build` passed and generated all 28 static pages. `npm run verify` passed for twelve public routes, nine account routes, metadata, links, assets and the existing rendering/advertising checks. All fourteen Firestore authorization tests passed with Node.js 26 and Java 21 against the isolated `demo-vihar` emulator. Logs are under ignored `output/node-runtime/`.

The locked Firebase CLI still pulls in `superstatic@10.0.0`, whose declared Node support ends at 24. npm reports an engine warning for that Firebase Hosting helper; installation and the Firestore tests succeeded on 26. This project serves the website through Next.js on Vercel. Existing upstream ESLint peer and package deprecation notices also remain.

Release through the existing GitHub `main` branch and Vercel connection. Keep Vercel's Node.js setting at `26.x` to match the repository, and inspect the hosted deployment status on the new commit after pushing.
