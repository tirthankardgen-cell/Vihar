# Vihar — A space to play.

Original browser games at [www.vihar.online](https://www.vihar.online), built with Next.js, React and TypeScript.

## Development

Use Node.js 26.x (also selected by `.nvmrc`), then run:

```sh
npm ci
npm run dev
# Production checks
npm run check
npm run verify
```

Use `npm run assets` to reproduce artwork, icons and fonts. Committed public assets are ready for deployment; regeneration is not required during a Vercel build.

Bap Ka Rasta has a visual game page with a 13-vehicle garage and a 57-image gallery. Gameplay, 3D characters, world renders and upcoming city concepts and promotional artwork are labelled separately. The showcase images can also be regenerated on their own with `node scripts/generate-game-showcase.mjs`.

See [development.md](development.md) for the single change history, configuration guide, asset provenance, validation evidence and agent handoff. The original design requirements remain in [website-brief.md](website-brief.md).

Vihar ID adds Google/email accounts, unique usernames, six gamer avatars, public profiles, friends and a personal dashboard. Configure the public Firebase variables in Vercel and publish the tested rules before using accounts in production; see [Vihar ID setup](development.md#vihar-id-configuration-and-operations). Run `npm run test:rules` with Java 21 for authorization checks, and `npm run assets:avatars` to reproduce the portraits. Existing game apps remain independent until their account/stat integrations are implemented.

AdSense ownership metadata and ads.txt remain available while advertising is paused for review. Ads require explicit serving, site-approval, and consent-readiness settings, and can load only on the completed first-drive guide. Preview, game launch, upcoming, navigation, support, legal and missing pages have no ad loader. See [development.md](development.md#adsense-review-and-account-setup) for the policy audit and account setup; settings are in [.env.example](.env.example). Google approval is still required.

## Repository layout

- `src/app`: pages, styles and metadata/text routes.
- `src/components` and `src/lib`: reusable UI, typed content and configuration.
- `public`: deployed assets and font licences.
- `assets/original` and `logo.png`: authoring inputs; retain for reproduction.
- `scripts`: asset generation and production HTTP checks.
- `.github/workflows`: CI checks.

Deploy with Vercel's Next.js preset, repository root, Node 26.x, `npm ci`, and `npm run build`. Keep the default Next.js output directory. Keep Vercel's Node.js setting at `26.x` to match `package.json` and `.nvmrc`; Vercel gives `package.json` priority over its project setting. A push to the connected production branch can trigger deployment.

The [Vihar launch kit](launch-kit/README.md) includes 15 Instagram posters, captions, a Vihar DP and Facebook covers.

### Community games / Creator studio

Signed-in users with a Vihar profile can submit an existing public HTTPS game URL at `/dashboard/publish`. Listings can be saved as drafts, edited, published or unpublished. Published listings appear on `/games`, with a shareable `/community/{id}` page. Vihar lists games; game files remain on their creator's hosting.

The creator studio displays an aggregate count of unique signed-in accounts that opened each game or download page from Vihar (excluding its owner), plus ratings and written reviews. This is not concurrent player telemetry or a measure of in-game activity. Launch receipts are immutable and keyed by UID; players can create/update/delete only their own review after launching. Raw player receipts are private to the player and creator. Reviews are public while the game is published. These browser-originated signals are not anti-fraud verified gameplay.

Deploy the updated `firestore.rules` to your configured Firebase project before releasing the UI (`firebase deploy --only firestore:rules`). No composite index or Storage changes are required. Validate locally with `npm run check` and `npm run test:rules` (Java 21+ required). Smoke test two accounts: publish as a creator, launch and review as a player, return to Creator studio and refresh stats, then unpublish and confirm the listing disappears from public discovery.

### Vihar World direction (internal context)

Vihar World will be like the “YouTube of games”: Vihar publishes its own games, while other users create accounts to discover and play games and post their own self-hosted browser or downloadable game links for others to enjoy. This analogy is internal context for README.md and developer.md only, not website marketing copy. Public messaging emphasizes games from Vihar and independent creators, sharing games, reaching players and learning from feedback.

Official Instagram: https://www.instagram.com/vihar.world. See [developer.md](developer.md) for publishing, statistics, security and search-discovery implementation details.

The XML sitemap and HTML site map now include published community listings and refresh every five minutes. `lastmod` reflects real content edits. Published game pages render content and canonical metadata on the server. Google controls crawl timing; submit `/sitemap.xml` in Search Console and inspect new URLs after deployment. Sitemap freshness does not guarantee immediate indexing.

Creator studio now includes a four-step editor with cover/screenshot URLs, play instructions, controls, device requirements and a public-page preview. Content and Analytics show lifetime game opens and player feedback. Rating badges cover community games and playable Vihar games; Bap Ka Rasta accepts reviews after a signed-in launch. Upcoming games open reviews on release. Dashboard navigation and content scroll independently on desktop, and dashboard routes have no footer. Deploy the updated Firestore rules before the website update; see the November 2026 section of `development.md` for rollout and verification limits.
