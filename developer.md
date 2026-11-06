# Vihar World: developer guide

## Product direction (internal context)

Vihar World aims to be the “YouTube of games”: a shared discovery platform where Vihar publishes its own games and other creators create accounts and publish links to self-hosted browser games or downloadable games. Players discover games, create accounts, open games and share reviews. Keep this analogy in README.md and developer.md; do not use it in public website copy.

Public positioning: discover games from Vihar and independent creators; share your game, reach players and learn from their feedback. Official Instagram: https://www.instagram.com/vihar.world.

## Creator publishing

Use existing Firebase Auth and profiles. `/dashboard/publish` supports draft/published listings, editing, browser/download type and HTTPS URLs. `/games` discovers published community listings; `/community/{id}` is their shareable page. Games and downloads stay on the creator's host. Do not claim Vihar uploads or hosts game binaries.

Firestore collections: `communityGames/{id}`, `players/{uid}` and `reviews/{uid}` under each game. Enforce ownership and schema in rules, not only forms. Immutable player receipts count unique signed-in accounts opening a game or download page, excluding the creator. They do not prove gameplay or a completed download and do not measure concurrent players. Reviews require a receipt, are one per player, and editable/deletable only by that player. Creators cannot rewrite or remove feedback. Unpublishing hides the listing and reviews from public reads.

Deploy firestore.rules before the website update. Run `npm run check`, `npm run test:rules`, and `npm run verify`. The rules emulator needs Java 21+ and access to the Firebase emulator download. Test creator/player/anonymous flows, draft privacy, repeated launches, reviews, download listings and login return paths.

## Search discovery

`/sitemap.xml` and the HTML `/site-map` include published community games using public Firestore REST reads; no Admin SDK or secret credentials. Server-rendered public game titles/descriptions and canonical metadata support discovery. Drafts and unavailable listings are excluded and return a real 404, with Next.js’s automatic error-page noindex. Firestore must have the deployed community rules and NEXT_PUBLIC_FIREBASE_PROJECT_ID configured. The server must reach firestore.googleapis.com.

Sitemap and public listing data refresh every 300 seconds on demand. Every public sitemap entry carries the owner-requested daily change-frequency hint and maximum priority (1.0), including published community listings. Google ignores these two hints; they do not schedule daily crawls or guarantee indexing. Use actual content-update timestamps for lastmod, never the request time. robots.txt advertises the canonical XML sitemap. External Instagram URLs and account-only dashboard routes belong in navigation, not the website's XML sitemap.

A shorter cache lifetime makes new URLs available sooner but cannot force Google to crawl or index them. After release, submit the canonical /sitemap.xml in Google Search Console, check its fetch status and inspect new public URLs. Keep production robots permissive and previews noindex. Do not manipulate lastmod, promise indexing deadlines, or use retired sitemap ping endpoints.

Community listing fetches time out after ten seconds and fall back to the core site map on permission/network/backend errors. This prevents Firestore rule rollout timing from failing Vercel builds. Failures are logged; both sitemap routes retry on their five-minute revalidation cycle. Publishing still requires deployed Firestore rules.

## Indexing, Bing and canonical migration

Public production content inherits index/follow. At the owner’s clarified request, account, dashboard, profile/card and hero-preview routes retain noindex and stay outside the public sitemap. Authentication and data access rules are unchanged. Vercel preview deployments still disallow crawling and use noindex; Next.js automatically noindexes missing pages. Do not manufacture indexable “game unavailable” pages.

Every public and account route has its own title and description; the HTTP verifier checks uniqueness. BING_SITE_VERIFICATION emits the public msvalidate.01 meta tag when supplied. The real value must come from the owner’s Bing Webmaster Tools account; a sample token is only used in local validation and is never committed as production config. Alternatively import the verified Search Console property in Bing. Submit the final canonical sitemap in both services.

For the requested non-www domain migration: first connect vihar.online directly to Production in Vercel Domains (remove its redirect to www), then set www.vihar.online to redirect to vihar.online. Add vihar.online to Firebase Auth authorized domains and check OAuth/email action URLs. Set SITE_URL=https://vihar.online and redeploy. All metadata, sitemap and robots references follow SITE_URL; the code enables a path/query-preserving permanent www-to-apex redirect only when that origin is configured. The default canonical origin is now https://vihar.online. Live checks on 2026-11-06 confirmed apex HTTP 200 and www HTTP 301 to apex; both 301 and 308 are permanent redirects. No Vercel credentials or Bing token were available in this task.

The owner clarified “scrobage” means scorebadge.com, an external website audit and embeddable score service. No scroll indicator or unverified score badge is included. A real badge requires the service’s scan/login and embed output; it is not Google certification or an indexing guarantee.
