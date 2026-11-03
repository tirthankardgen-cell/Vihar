# Vihar World: developer guide

## Product direction (internal context)

Vihar World aims to be the “YouTube of games”: a shared discovery platform where Vihar publishes its own games and other creators create accounts and publish links to self-hosted browser games or downloadable games. Players discover games, create accounts, open games and share reviews. Keep this analogy in README.md and developer.md; do not use it in public website copy.

Public positioning: discover games from Vihar and independent creators; share your game, reach players and learn from their feedback. Official Instagram: https://www.instagram.com/vihar.world.

## Creator publishing

Use existing Firebase Auth and profiles. `/dashboard/publish` supports draft/published listings, editing, browser/download type and HTTPS URLs. `/games` discovers published community listings; `/community/{id}` is their shareable page. Games and downloads stay on the creator's host. Do not claim Vihar uploads or hosts game binaries.

Firestore collections: `communityGames/{id}`, `players/{uid}` and `reviews/{uid}` under each game. Enforce ownership and schema in rules, not only forms. Immutable player receipts count unique signed-in accounts opening a game or download page, excluding the creator. They do not prove gameplay or a completed download and do not measure concurrent players. Reviews require a receipt, are one per player, and editable/deletable only by that player. Creators cannot rewrite or remove feedback. Unpublishing hides the listing and reviews from public reads.

Deploy firestore.rules before the website update. Run `npm run check`, `npm run test:rules`, and `npm run verify`. The rules emulator needs Java 21+ and access to the Firebase emulator download. Test creator/player/anonymous flows, draft privacy, repeated launches, reviews, download listings and login return paths.

## Search discovery

`/sitemap.xml` and the HTML `/site-map` include published community games using public Firestore REST reads; no Admin SDK or secret credentials. Server-rendered public game titles/descriptions and canonical metadata support discovery. Drafts are excluded and receive noindex metadata. Firestore must have the deployed community rules and NEXT_PUBLIC_FIREBASE_PROJECT_ID configured. The server must reach firestore.googleapis.com.

Sitemap and public listing data refresh every 300 seconds. Use actual content-update timestamps for lastmod, never the request time. robots.txt advertises the canonical XML sitemap. External Instagram URLs and account-only dashboard routes belong in navigation, not the website's XML sitemap.

A shorter cache lifetime makes new URLs available sooner but cannot force Google to crawl or index them. After release, submit the canonical /sitemap.xml in Google Search Console, check its fetch status and inspect new public URLs. Keep production robots permissive and previews noindex. Do not manipulate lastmod, promise indexing deadlines, or use retired sitemap ping endpoints.
