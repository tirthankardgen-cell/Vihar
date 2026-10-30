# Vihar — A space to play.

![Vihar: original games, different worlds](public/images/social-vihar.png)

A welcoming home for original browser games. Built with Next.js App Router, React, TypeScript, and Tailwind CSS, with original Vihar illustrations, local fonts, and statically generated public pages.

**Catalogue:** [www.vihar.online](https://www.vihar.online) · **Game:** [Bap Ka Rasta](https://rasta.vihar.online) · **Support:** [contact@vihar.online](mailto:contact@vihar.online)

The repository is connected to [the Vihar project on Vercel](https://vercel.com/tirthankar-s/vihar). The catalogue is already live: **vihar.online** redirects to **www.vihar.online**, which is the canonical origin used by metadata and the sitemap.

## Run locally

Use **Node.js 22.x** and npm.

~~~sh
npm ci
npm run dev
~~~

Open [localhost:3000](http://localhost:3000). An environment file is optional; the defaults use the addresses above.

~~~sh
npm run check
npm run verify
npm start
~~~

- **check** runs ESLint, Next.js route type generation, TypeScript, and the production build.
- **verify** starts a temporary production server and checks public routes, unique metadata, canonical URLs, structured data, local links, assets, robots, sitemap, manifest, launch links, support email, headers, and the real 404 response. Run it after building.
- **start** serves the production build for review.

GitHub Actions runs installation, checks, and production verification on pushes to main and pull requests. Browser interaction and visual review are documented separately in [verification notes](docs/verification.md).

## Deploy on Vercel

1. Open [the existing Vercel project](https://vercel.com/tirthankar-s/vihar). To create another deployment, import [tirthankardgen-cell/Vihar](https://github.com/tirthankardgen-cell/Vihar) into a separate project.
2. Use the repository root, **Next.js**, and **Node.js 22.x**.
3. Keep the install command as **npm ci**, build command as **npm run build**, and the default Next.js output setting.
4. Push to **main** to trigger the connected Vercel deployment. There are no API keys, databases, or required secrets.
5. Keep **www.vihar.online** as the primary domain and **vihar.online** redirected to it. This matches the existing live configuration.
6. For a fresh project or domain, use the exact DNS records Vercel supplies. Keep game subdomains on their independent projects.

Full settings, SEO checks, and the launch checklist are in [the deployment guide](docs/deployment.md).

## Configuration

Optional build-time environment variables are documented in [.env.example](.env.example). Redeploy after changing one.

| Variable | Default | Purpose |
| --- | --- | --- |
| SITE_URL | https://www.vihar.online | Canonical origin for metadata, sitemap, and structured data |
| BAP_KA_RASTA_URL | https://rasta.vihar.online | Independent game launch address |
| SUPPORT_EMAIL | contact@vihar.online | Public mailbox across Contact, footer, and policies |

Preview deployments marked by Vercel’s VERCEL_ENV=preview use noindex metadata and a disallowing robots.txt. Production pages point to the configured canonical domain.

## Pages and behaviour

| Route | Content |
| --- | --- |
| / | Brand introduction, featured game, collection, and studio story |
| /games | Searchable catalogue with availability filters and an empty state |
| /games/bap-ka-rasta | Play link, genuine gameplay screenshots, controls, and device guidance |
| /games/ekka-chor | Honest coming-soon page with no game launch link |
| /about | Brand story, name, emblem meaning, and principles |
| /help | Keyboard-accessible FAQs and troubleshooting |
| /contact | Direct email and contextual support links |
| /privacy | Current data, hosting, storage, and external-game disclosures |
| /terms | Platform use, early builds, ownership, and contact |

Unknown URLs return a branded HTTP 404. The catalogue never embeds or preloads the game engine, models, or audio. Each game owns its own deployment and performance budget.

There are no accounts, ads, analytics trackers, newsletter collection, contact-form database, or application cookies. Contact links open the visitor’s email app. If services are added later, update the actual integration, privacy disclosures, and any necessary consent behaviour together.

## Brand and assets

The supplied logo and [project brief](website-brief.md) are the starting point. The production system preserves the charcoal gateway/V emblem, terracotta dot, uppercase VIHAR wordmark, and “A space to play.” tagline.

The site uses local Newsreader and DM Sans fonts with their OFL licences, responsive AVIF/WebP delivery, original courtyard and play-board artwork, accessible focus styles, and reduced-motion support. Concept images and actual gameplay are labelled separately.

Production assets are committed, so deployment does not regenerate them. To regenerate the logo masters, illustrations, local font copies, favicons, sharing cards, and optimized gameplay captures:

~~~sh
npm run assets
~~~

Read [the asset register](assets/README.md) for provenance and licensing boundaries. Sarvam was studied for whitespace, typography, and atmosphere; its artwork, source, and brand assets are not used.

## Project map

~~~text
src/app/             Public pages, metadata routes, layout, and responsive styles
src/components/      Brand, navigation, catalogue, structured data, and page patterns
src/lib/             Typed game data and validated public configuration
public/              Committed, deployable images, fonts, icons, and brand masters
assets/original/     Editable artwork and source game captures; not served to visitors
scripts/             Reproducible asset generation and production HTTP verification
docs/                Hosting and verification notes
.github/workflows/   Build and verification workflow
~~~

Original project code and branding are not licensed for general redistribution. The package is marked UNLICENSED. Third-party dependencies and individually credited assets retain their own licences.
