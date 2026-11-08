<div align="center">

<img src="public/images/social-vihar.png" alt="Vihar — A space to play" width="900" />

# Vihar

**A space to play. A place for your next adventure.**

Discover original browser games, explore independent creations, and share the worlds you build.

[Visit Vihar](https://vihar.online) · [Explore games](https://vihar.online/games) · [Creator studio](https://vihar.online/dashboard/publish) · [Instagram](https://www.instagram.com/vihar.world)

[![Website checks](https://github.com/tirthankardgen-cell/Vihar/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tirthankardgen-cell/Vihar/actions/workflows/ci.yml)
![Node.js 26](https://img.shields.io/badge/Node.js-26-417E38?logo=nodedotjs&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js-16-111111?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-98754B)](LICENSE)

</div>

---

## The experience

Vihar brings games from Vihar and independent creators into one discovery platform. Players can find something to play, build a Vihar ID, and leave useful feedback. Creators can give their self-hosted games a dedicated page and learn from the people who open them.

| For players | For creators |
| --- | --- |
| Discover browser and downloadable games | Publish through a four-step creator studio |
| Explore artwork, screenshots, and play guides | Add game links, cover images, screenshots, and instructions |
| Create a profile, save favourites, and connect with friends | Preview a listing, save drafts, publish, and edit |
| Rate and review released games after opening them | View unique game opens, average ratings, and written feedback |

- **Production:** [https://vihar.online](https://vihar.online)
- **Playable Vihar game:** [Bap Ka Rasta](https://rasta.vihar.online)
- **Contact:** [contact@vihar.online](mailto:contact@vihar.online)

### Made for discovery

- **Clear collections:** VIHAR Originals and Community Games have separate discovery pages, origin badges, creator attribution, player-rated rankings and recommendation carousels.
- **Game pages:** individual descriptions, screenshots, controls, device requirements, and how-to-play instructions.
- **Creator studio:** Details → Images & play guide → Preview → Visibility, with separate Content and Analytics views.
- **Player feedback:** thumbnail rating badges, star distributions, and editable reviews for released games. Upcoming games open reviews on release.
- **Vihar ID:** Google/email authentication, unique usernames, avatars, public profiles, favourites, and friends.
- **Focused dashboard:** independent navigation and content scrolling on desktop; a natural mobile layout with no dashboard footer.
- **Search foundations:** server-rendered public listings, canonical metadata, structured data, and a sitemap that refreshes community listings every five minutes.

Games and downloads remain on their creators’ hosting. Images are supplied as public HTTPS URLs. “Unique game opens” counts signed-in accounts opening a game or download page from Vihar. Connected games separately report session counts and active play time through the Vihar ID SDK. Account and saved-progress games offer Vihar ID sign-in on the studio's own website; direct-play games use tracking without requiring in-game login. See the [integration guide](docs/VIHAR_ID.md).

## Start developing

Use **Node.js 26.x**, as specified in [`.nvmrc`](.nvmrc). Java 21 or newer is needed for Firestore rules tests.

```sh
git clone https://github.com/tirthankardgen-cell/Vihar.git
cd Vihar
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Configure the Firebase web values in `.env.local` for account features, or use the local emulators described in [Getting started](docs/GETTING_STARTED.md). Never commit credentials or enable emulators in production.

On Windows, the project folder can show the website's icon using the included `desktop.ini`. After cloning, run `attrib +r .` and `attrib +h +s desktop.ini` from the project directory, then refresh File Explorer. The folder references `public/favicon.ico`, so it stays aligned with the website's favicon.

### Quality checks

```sh
npm run check       # Lint, unit tests, TypeScript, and production build
npm run test:rules  # Firestore authorization tests; requires Java 21+
npm run test:integration # Vihar ID API against Auth and Firestore emulators
npm run verify     # HTTP, assets, SEO, and policy checks against the built site
```

The GitHub Actions workflow runs website checks and authorization tests on pull requests and pushes to `main`. See [Contributing](CONTRIBUTING.md) for the review checklist and browser smoke tests.

## Technology

| Layer | Implementation |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Interface | Tailwind CSS, scoped CSS, Motion, Lucide icons |
| Identity & data | Firebase Authentication and Cloud Firestore |
| Assets | Optimized local imagery, self-hosted fonts, Sharp tooling |
| Hosting | Vercel; production branch `main` |
| Verification | ESLint, TypeScript, Node.js tests, Firebase Emulator Suite, HTTP checks |

## Repository guide

```text
src/app/           Pages, layouts, styles, and route handlers
src/components/    Shared interfaces, account features, and creator studio
src/lib/           Typed content, Firebase setup, and domain logic
public/            Production artwork, fonts, branding, and notices
assets/            Original authoring inputs
scripts/           Asset tooling and automated verification
docs/              Setup, architecture, and production operations
.github/           CI workflow, issue forms, and pull-request template
```

## Documentation

| Document | Purpose |
| --- | --- |
| [Getting started](docs/GETTING_STARTED.md) | Local setup, environment values, emulators, and commands |
| [Architecture](docs/ARCHITECTURE.md) | Application boundaries, publishing, ratings, and data access |
| [Vihar ID integration](docs/VIHAR_ID.md) | Studio sign-in, SDK, tracking, cloud saves, permissions and tests |
| [Discovery and indexing](docs/DISCOVERY_AND_INDEXING.md) | Collections, ranking rules, crawler access and IndexNow |
| [Deployment](docs/DEPLOYMENT.md) | Vercel configuration, Firebase rules, release checks, and rollback |
| [Contributing](CONTRIBUTING.md) | Contribution process, standards, and validation |
| [Security](SECURITY.md) | Private vulnerability reporting and supported code |
| [Support](SUPPORT.md) | Help, bug reports, account issues, and creator questions |
| [Code of conduct](CODE_OF_CONDUCT.md) | Community expectations and reporting |
| [Changelog](CHANGELOG.md) | Notable repository changes |
| [License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md) | Ownership and third-party material |
| [Developer guide](developer.md) | Product direction and implementation guidance |
| [Development record](development.md) | Detailed change history, configuration, assets, and verification evidence |
| [Launch kit](launch-kit/README.md) | Existing promotional assets and captions |

## Production

The canonical website is **[vihar.online](https://vihar.online)**. Vercel uses the Next.js preset, Node.js 26.x, `npm ci`, and `npm run build`. Pushes to the connected `main` branch can trigger production deployment.

Deploy compatible Firestore rules **before** releasing features that depend on them. A website build does not deploy Firebase rules. Follow the [deployment guide](docs/DEPLOYMENT.md) and verify the Vercel deployment result rather than treating a successful Git push as a successful release.

Advertising is paused by default. Publisher verification metadata and `ads.txt` remain available; serving ads requires the existing approval and consent settings. See [`.env.example`](.env.example) and the [development record](development.md) before changing these controls.

## Ownership

Vihar is **proprietary**, not an open-source release. Original code, branding, games, writing, and artwork retain their existing ownership; public source access does not grant a general right to redistribute or republish them. See [LICENSE](LICENSE). Fonts, icons, and dependencies retain their own licenses, listed in [Third-party notices](THIRD_PARTY_NOTICES.md).

For usage permission, collaboration, or support, contact [contact@vihar.online](mailto:contact@vihar.online).
