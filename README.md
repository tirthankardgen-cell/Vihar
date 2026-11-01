# Vihar — A space to play.

Original browser games at [www.vihar.online](https://www.vihar.online), built with Next.js, React and TypeScript.

## Development

Use Node.js 22.x, then run:

```sh
npm ci
npm run dev
# Production checks
npm run check
npm run verify
```

Use `npm run assets` to reproduce artwork, icons and fonts. Committed public assets are ready for deployment; regeneration is not required during a Vercel build.

Bap Ka Rasta has a visual game page with a six-ride garage and a 27-image gallery. Gameplay, 3D characters, world renders and future city/vehicle concepts are labelled separately. The showcase images can also be regenerated on their own with `node scripts/generate-game-showcase.mjs`.

See [development.md](development.md) for the single change history, configuration guide, asset provenance, validation evidence and agent handoff. The original design requirements remain in [website-brief.md](website-brief.md).

AdSense ownership metadata and ads.txt remain available while advertising is paused for review. Ads require explicit serving, site-approval, and consent-readiness settings, and can load only on the completed first-drive guide. Preview, game launch, upcoming, navigation, support, legal and missing pages have no ad loader. See [development.md](development.md#adsense-review-and-account-setup) for the policy audit and account setup; settings are in [.env.example](.env.example). Google approval is still required.

## Repository layout

- `src/app`: pages, styles and metadata/text routes.
- `src/components` and `src/lib`: reusable UI, typed content and configuration.
- `public`: deployed assets and font licences.
- `assets/original` and `logo.png`: authoring inputs; retain for reproduction.
- `scripts`: asset generation and production HTTP checks.
- `.github/workflows`: CI checks.

Deploy with Vercel's Next.js preset, repository root, Node 22.x, `npm ci`, and `npm run build`. Keep the default Next.js output directory. A push to the connected production branch can trigger deployment.
