# Getting started

## Prerequisites

- Node.js **26.x** and npm; `.nvmrc` is the source of truth.
- Git and an authorized checkout of this repository.
- Java **21+** for Firestore emulator tests.
- Network access to npm and Firebase emulator downloads during initial setup.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. Public editorial pages can be developed without Firebase configuration; account and community data features need Firebase or local emulators.

## Environment configuration

[`.env.example`](../.env.example) lists the supported values and safe defaults. `.env.local` is ignored by Git.

| Group | Purpose |
| --- | --- |
| `SITE_URL` | Canonical HTTPS origin; production uses `https://www.vihar.online` |
| `BAP_KA_RASTA_URL` | Independent playable game deployment |
| `GULAM_CHOR_URL` | Gulam Chor's independent browser game deployment |
| `SUPPORT_EMAIL` | Public support contact |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web application identifiers |
| `NEXT_PUBLIC_FIREBASE_EMULATORS` | Local-only emulator switch; keep false in production |
| `ADSENSE_*` | Existing publisher, approval, consent-readiness, and serving controls |
| `GOOGLE_SITE_VERIFICATION` | Optional Search Console verification value |

`NEXT_PUBLIC_*` values are included in browser JavaScript. Never place a service-account key, private API credential, or server secret in one. Firebase authorization is enforced by the deployed rules and authenticated identity.

## Local accounts and game data

For isolated testing, set this in `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_EMULATORS=true
```

In separate terminals:

```sh
npm run emulators
```

```sh
npm run dev
```

The client uses the `demo-vihar` project, Authentication on `127.0.0.1:9099`, and Firestore on `127.0.0.1:8080`. Emulator mode is restricted to localhost. Use local test accounts and synthetic data. Do not assume emulator data persists across restarts. Restart the development server after changing environment values.

Stop any existing emulator instance before running `npm run test:rules`, which manages its own Firestore test process. If the emulator binary cannot download, resolve network access; do not treat the skipped authorization tests as successful.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run check` | Lint, unit tests, TypeScript, production build |
| `npm run test:rules` | Firestore authorization tests |
| `npm run verify` | HTTP checks against the built production site |
| `npm run start` | Serve an existing production build |
| `npm run assets` | Regenerate the asset pipeline |
| `npm run assets:avatars` | Regenerate player avatars |

Committed public assets are ready to use. Regeneration is unnecessary for routine builds and may modify many files. Consult the asset register in [development.md](../development.md) before changing original imagery or fonts.

Continue with [Architecture](ARCHITECTURE.md), [Contributing](../CONTRIBUTING.md), and [Deployment](DEPLOYMENT.md).
