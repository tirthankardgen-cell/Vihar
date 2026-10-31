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

See [development.md](development.md) for the single change history, configuration guide, asset provenance, validation evidence and agent handoff. The original design requirements remain in [website-brief.md](website-brief.md).

AdSense review metadata and ads.txt use the owner's public publisher ID. The async AdSense script loads in every production page head by default; previews exclude it. Set ADSENSE_ENABLED=false to pause it. See development.md for account-side settings. Optional public configuration is in [.env.example](.env.example).

## Repository layout

- `src/app`: pages, styles and metadata/text routes.
- `src/components` and `src/lib`: reusable UI, typed content and configuration.
- `public`: deployed assets and font licences.
- `assets/original` and `logo.png`: authoring inputs; retain for reproduction.
- `scripts`: asset generation and production HTTP checks.
- `.github/workflows`: CI checks.

Deploy with Vercel's Next.js preset, repository root, Node 22.x, `npm ci`, and `npm run build`. Keep the default Next.js output directory. A push to the connected production branch can trigger deployment.
