# Contributing to Vihar

Help make Vihar easier to discover, more enjoyable to use, and safer for its players and creators. Start with a clear problem, keep changes focused, and describe how you verified the result.

## Before you begin

Read the [README](README.md), [setup guide](docs/GETTING_STARTED.md), and [Code of conduct](CODE_OF_CONDUCT.md). This repository is proprietary; [LICENSE](LICENSE) governs reuse. Public visibility and this guide do not grant a general development or redistribution license. Discuss code contributions and obtain any necessary permission from the maintainers before working on a contribution. Contributors retain their existing rights; any required permission to incorporate or distribute a contribution must be agreed with the maintainers before merge. This guide does not assign copyright.

For substantial features or design changes, open a feature request first. Report vulnerabilities privately through [SECURITY.md](SECURITY.md), not a public issue.

## Development workflow

1. Use an authorized checkout and create a focused branch from the latest `main`.
2. Install with `npm ci` on Node.js 26.x. Follow [local setup](docs/GETTING_STARTED.md).
3. Read `AGENTS.md` and the installed Next.js documentation before changing framework behavior.
4. Implement the smallest complete change that solves the stated problem.
5. Run the checks below and open a pull request using the repository template.

```sh
npm run check
npm run test:rules
npm run verify
git diff --check
```

`verify` requires a successful production build. Rules tests require Java 21+ and network access for the emulator download. Report blocked checks explicitly; a test that could not run is not a passing test. Documentation-only changes need link, formatting, and configuration checks rather than a fresh application build.

## Standards

- Keep TypeScript types explicit at data boundaries. Follow the surrounding code style.
- Enforce data access and schema restrictions in Firestore rules, not only in forms.
- Preserve accessibility: keyboard navigation, visible focus, readable contrast, semantic controls, and useful error messages.
- Check narrow mobile layouts and desktop dashboard scrolling when changing interface structure.
- Keep game statistics accurate. Do not label launch receipts as verified gameplay, live players, or completed downloads.
- Preserve draft privacy, ownership rules, and players’ control of their own reviews.
- Use only images and other material you have permission to contribute; record provenance and preserve third-party notices.
- Do not commit credentials, personal account data, build output, emulator data, or local environment files.
- Keep existing advertising, preview/noindex, asset-size, and SEO checks intact.

## Browser checks for publishing changes

Use local test accounts. Create a listing as a creator, save a draft, add its images and instructions, preview it, then publish. Open and review it as a different player. Confirm that a player can edit or delete only their own review and that unpublished listings are hidden from public discovery. Check official-game reviews, loading/error states, mobile layout, and desktop pane scrolling where affected.

## Pull requests

Explain the problem, final behavior, validation, and any deployment dependencies. Include before/after screenshots for visual changes without exposing private data. Link the related issue and document schema/rules changes. Maintainers review changes before integration; production releases follow [Deployment](docs/DEPLOYMENT.md).
