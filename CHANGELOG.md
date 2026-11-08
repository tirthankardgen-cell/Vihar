# Changelog

Notable repository changes are recorded here. Entries describe source changes; they do not independently confirm production deployment. See [GitHub history](https://github.com/tirthankardgen-cell/Vihar/commits/main/) and [development.md](development.md) for detailed implementation evidence.

## 2026-11-08 — Originals, community discovery and search indexing

- Distinguished VIHAR Originals and Community Games across discovery, game pages, creator profiles and player activity, with dedicated collection URLs.
- Added a rated Community Top 5 with oversized numbers and mixed recommendations, retaining Vihar's warm colors. Carousels support smooth scrolling, touch, arrow controls, hover effects and reduced motion, with hidden scrollbars and room for every rank number.
- Omitted empty ranking slots and sample games from production; published community games enter the rankings when they receive reviews.
- Added collection and publisher structured data, community images in the sitemap, explicit search crawler allowances and an opt-in post-deployment IndexNow submission command.
- Verified the production build, HTTP routes, authorization rules and responsive browser behavior from 320 to 1440 pixels.

## 2026-11-08 — Reviews and recorded play activity

- Fixed official-game sign-in return paths and retained review eligibility after guest play in the same tab.
- Made reviews more visible, added a dismissible post-play invitation, and closed the editor after successful saves.
- Matched rating bars to both game themes: gold/cream for Gulam Chor and rust/stone for Bap Ka Rasta, with consistent rounded shapes and accessible values.
- Recorded private, server-timestamped game opens from play links and displayed live dashboard totals, calendar days and recent activity.
- Kept game opens separate from trusted in-game sessions and time; added authorization and date-boundary coverage.

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
