# Changelog

Notable repository changes are recorded here. Entries describe source changes; they do not independently confirm production deployment. See [GitHub history](https://github.com/tirthankardgen-cell/Vihar/commits/main/) and [development.md](development.md) for detailed implementation evidence.

## 2026-11-06 — Interactive Vihar ID

- Replaced the dashboard ID with a two-sided player card using the supplied Kokonut UI Flick Card interaction.
- Added the same card to public profiles, with player details and a working profile link on the back.
- Supported drag, tap, keyboard, an explicit flip button, reduced motion, and narrow mobile layouts.
- Preserved photo sharing and PNG downloads and recorded the component's MIT attribution.

## 2026-11-04 — Repository documentation

- Reorganized the README around the product, production URL, setup, and documentation.
- Added licensing and third-party notices consistent with existing proprietary terms.
- Added contribution, security, support, and community guidance.
- Added setup, architecture, deployment, issue, and pull-request documentation.

## 2026-11-04 — Creator studio and player feedback

- Added a four-step game editor with cover/screenshot URLs, play guides, controls, requirements, and preview.
- Added Content and Analytics views with lifetime game opens and player feedback.
- Added shared review controls and rating badges for community and playable Vihar games.
- Removed the dashboard footer and separated desktop navigation/content scrolling.
- Expanded Firestore rules and authorization tests; rules deployment is a separate release step.

## 2026-11-03 — Community publishing foundation

- Added self-hosted game listings, creator statistics, player reviews, and public discovery.
- Added server-rendered community game metadata and sitemap discovery.
- Kept core sitemap generation available when community data cannot be read.
