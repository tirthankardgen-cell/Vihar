# Vihar development record

This is the single developer handoff, operational guide, asset register and change history. Read this file before changing the site. Keep README.md as a short entry point. Append dated entries with author, intent, files, checks and remaining work; never claim an unrun test passed. Use the existing checkout in isolated cloud tasks; do not create a worktree unless requested.

## Current configuration

- Canonical site: https://www.vihar.online; preserve the apex-to-www redirect in Vercel.
- Node.js 22.x; npm ci; npm run check; npm run verify. Build before verify.
- AdSense publisher: ca-pub-6693217545827146, explicitly supplied by the owner. This is a public identifier, not a secret.
- Default mode: the owner's supplied async AdSense loader is rendered once in the shared head on every production page, using ca-pub-6693217545827146. ADSENSE_ENABLED=false pauses it; Vercel previews always exclude it. The account verification meta tag and /ads.txt remain available in production. Google controls approval, ad availability and Auto ads placements; configure Privacy & messaging and the applicable certified consent message in AdSense. Script installation does not prove consent setup or approval. No ad-unit IDs are needed for this Auto ads snippet. This current configuration supersedes historical review-only instructions below.
- ADSENSE_PUBLISHER_ID overrides the default; explicitly empty with ADSENSE_ENABLED=false disables account metadata/declaration. Invalid IDs fail the build. Preview builds omit the publisher declaration and loader.
- GOOGLE_SITE_VERIFICATION optionally adds the Search Console HTML verification tag. The owner has not supplied a token. DNS verification can be used instead.
- Submit https://www.vihar.online/sitemap.xml to Search Console after deployment. Review robots.txt, manifest.webmanifest, ads.txt and llms.txt. Search Console submission and AdSense review remain account-side actions; code does not guarantee approval, indexing or ranking.
- Sitemap and robots already existed and are retained as Next.js metadata routes, avoiding duplicate static files. llms.txt is an optional factual discovery aid, not a recognized ranking guarantee. Visible FAQ answers and FAQPage JSON-LD share one source; Google generally restricts FAQ rich results to eligible government/health sites. Do not promise them for this game catalogue. Use accurate prose instead of keyword stuffing, fake reviews or fabricated ratings.

## Change history

### Install the supplied AdSense Auto ads head snippet — 2026-10-31 10:37:41 IST (UTC+05:30)

Author: Codex. The owner supplied Google's async script and requested placing it between head tags across the site. Enabled the loader by default and moved it from a deferred Next Script in the body to a native async script in the shared root head. Publisher ID and crossorigin=anonymous match the provided snippet. Previews still omit the script; ADSENSE_ENABLED=false remains an explicit off switch. Privacy disclosures already adapt to enabled mode. Updated configuration examples and verification to require exactly one matching async head script on each of the nine public routes, plus absence in preview/disabled mode. No Google account configuration or approval status is changed by this code.

Validation: npm run check passed (lint, TypeScript and production build). Production HTTP verification passed in default enabled mode, VERCEL_ENV=preview, and ADSENSE_ENABLED=false; each build was tested with matching environment values. Restored and verified the default enabled production build last. Checks cover one async head script on all nine pages, publisher/crossorigin attributes, preview/off suppression, matching privacy text, ads.txt and the existing site checks. git diff --check passed. Push to main continues the owner's authorized GitHub delivery workflow. Live ad delivery and AdSense approval remain Google-controlled and were not verified.


### Make FAQs visible on the homepage — 2026-10-31 03:23:01 IST (UTC+05:30)

Author: Codex. The owner could not find the FAQs and requested a correction and GitHub push. Previously the new answers were only on /help.

- Added a clearly titled Frequently asked questions section at /#faqs, before the closing homepage action, with a responsive two-column desktop / one-column mobile layout. The first answer is open on initial load; every answer uses native keyboard-accessible details/summary controls and works without JavaScript.
- Added FAQs links in desktop navigation, mobile navigation and the footer. The homepage section links to all Help questions and troubleshooting. Both pages use the same factual answer source.
- Kept FAQPage structured data on /help only to avoid repeating the same marked-up FAQ across pages. Removed a redundant homepage WebSite entity; the stable identified WebSite entity remains.
- Extended production verification to require the homepage FAQ anchor, heading, navigation link, initially open answer and all shared question/answer text.
- Validation: npm run check and npm run verify passed under Node.js 22, including the new homepage FAQ assertions; git diff --check passed. Push is explicitly authorized; deployment success remains separate from the push.


### Logo fidelity, discovery and AdSense review — 2026-10-31 03:12:32 IST (UTC+05:30)

Author: Codex, at the owner's request. Base GitHub commit: 4e893e0784e03211886e45f88dd25780a36bc174.

- Replaced the redrawn favicon with a square crop of the actual emblem in root logo.png: left 584, top 160, width/height 368. Preserve pixels, dot, shape and aspect ratio; exclude presentation text and sample icons. Regenerate ICO, PNG, Apple and manifest icons through npm run assets. Removed the competing public/icon.svg so browsers cannot prefer the old shape. Other header/vector branding is unchanged.
- Improved the homepage search title/description with truthful browser-game and Mumbai auto-rickshaw terms. Added a WebSite entity and visible discovery FAQs with matching FAQPage structured data. Existing canonicals, per-page metadata, sitemap and production/preview robots policy remain authoritative.
- Added optional Search Console verification, factual /llms.txt, validated AdSense config, account verification metadata, /ads.txt and a separately gated script. Updated privacy disclosures for review-only and enabled modes. Game content never depends on advertising availability.
- Consolidated deployment, verification and asset documentation into this file. Removed duplicate documents after preserving their content below, and shortened README. Retained the owner brief, original source artwork, font licences, lockfile and all runtime assets because they are needed for provenance or reproducibility.
- Tests: passed; see the dated validation entry below.
- No GitHub push, Vercel deployment, domain changes or account-setting changes are part of this local edit.

### GitHub publication authorized — 2026-10-31 03:16:45 IST (UTC+05:30)

Author: Codex. The owner explicitly requested committing and pushing all prepared changes to GitHub. Their AdSense screenshot shows vihar.online as Getting ready and ads.txt as Not found. The /ads.txt route supplies `google.com, pub-6693217545827146, DIRECT, f08c47fec0942fa0` in production. Keep ad serving disabled while review is pending. Fetch confirmed origin/main still matches base 4e893e0, with no remote changes to merge. Push this change to main for the connected Vercel build; a Git push alone does not establish deployment success or AdSense approval. After deployment, verify https://www.vihar.online/ads.txt and allow Google to recrawl it. This supersedes the earlier local-only delivery status, not its validation evidence.

## Current validation — 2026-10-31 03:15:24 IST (UTC+05:30)

Author: Codex. Executed on Linux with Node.js 22.23.4 using the existing lockfile.

- npm ci completed; npm reported upstream ESLint peer-range warnings, but installation and strict lint succeeded. No dependency versions or lockfile were changed.
- npm run assets completed. Visually inspected the original logo and generated 192px icon. The automated 48px icon comparison proves pixels match a proportional resize of the source crop. Unrelated platform-dependent re-encodes of social artwork were discarded.
- npm run check passed (zero-warning lint, route type generation, TypeScript, production build).
- npm run verify passed: nine public pages, unique metadata, normalized canonical links, JSON-LD, local links, committed images/fonts/icons, sitemap, robots, manifest, launch/contact links, headers, 404, matching visible FAQs, original-logo icon, ads.txt and llms.txt.
- Built and verified ADSENSE_ENABLED=true: standard loader is present, publisher metadata/declaration match the owner's ID, and privacy text reflects enabled mode. This checks rendered HTML; it does not contact Google, request ads, or validate account approval.
- Built and verified VERCEL_ENV=preview with ADSENSE_ENABLED=true: no ad loader or publisher declaration, plus noindex/disallow robots behavior.
- Rebuilt and reran checks in default review-only mode last. git diff --check passed. No deployment or push performed. Live browser ad delivery, CMP configuration and Search Console ownership/submission were not tested.

## Historical reference (preserved from the previous commit)

The sections below record earlier work, not freshly executed tests. Their claims about no advertising and redrawn favicons are superseded by Current configuration and the change history above. Historical screenshots/Lighthouse values were reported by that implementation and are not new measurements.


### Archived source: docs/deployment.md

# Deploying Vihar

## Project settings

The repository is already connected to [the Vihar project on Vercel](https://vercel.com/tirthankar-s/vihar). Its live catalogue is [www.vihar.online](https://www.vihar.online). Pushes to **main** trigger production deployments.

For the existing project, or when importing [the Vihar GitHub repository](https://github.com/tirthankardgen-cell/Vihar) into a new project, use:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | Repository root |
| Node.js | 22.x |
| Install command | npm ci |
| Build command | npm run build |
| Output directory | Leave the Next.js default |
| Production branch | main |

The framework and commands are also declared in vercel.json. All nine public pages are prerendered. Next.js serves optimized images and metadata routes; this is not configured as a static HTML export.

All assets needed by a fresh clone are committed. Asset generation is an authoring operation, not a build prerequisite. Keep package-lock.json and use npm ci so the deployed dependency tree matches verification.

## Domain and email

1. Keep **www.vihar.online** as the catalogue’s canonical domain.
2. Keep **vihar.online** redirected to **www.vihar.online**. The live setup returns HTTP 308 for this redirect.
3. For a fresh domain configuration, add both hostnames to the catalogue project and use the **exact DNS records shown by Vercel**. Wait for domain validation and HTTPS.
4. Leave **rasta.vihar.online** attached to the independent Bap Ka Rasta project.
5. Confirm **contact@vihar.online** can receive and reply to email through the owner’s mail provider. Web hosting does not create the mailbox or its MX records.

The owner confirmed the mailbox address and game hostname. Both the catalogue and game were reached over HTTPS on 31 October 2026; the game was also opened through to gameplay during implementation. No DNS or email-provider settings were changed by this work.

The brief proposed the apex domain as canonical. The implementation follows the existing live **www** redirect instead, so search engines receive a consistent final address. To switch to the apex domain later, reverse the Vercel redirect and change SITE_URL together, then redeploy.

## Environment

Defaults are suitable for the intended production domain:

~~~dotenv
SITE_URL=https://www.vihar.online
BAP_KA_RASTA_URL=https://rasta.vihar.online
SUPPORT_EMAIL=contact@vihar.online
~~~

These values are public configuration, not secrets. SITE_URL must be an HTTPS origin without a path, query, credentials, or fragment. The game URL must use HTTPS. Invalid values fail the build. Changes require a new build because pages are prerendered.

Vercel supplies VERCEL_ENV automatically. **Preview** builds emit noindex/nofollow metadata and disallow crawling in robots.txt. Keep the canonical origin set to the intended public domain, rather than a temporary preview URL. Robots directives discourage indexing; they are not access control. Use Vercel deployment protection for private previews if needed.

## Before sharing the production address

- Open the homepage, catalogue, both game pages, About, Help, Contact, Privacy, and Terms.
- Verify the homepage and detail-page Play links open **rasta.vihar.online** in a new tab.
- Try search, both availability filters, the empty state, mobile navigation, and the Help accordions.
- Confirm the contact email works in an email client.
- Check the mobile portrait and landscape layouts and keyboard focus.
- Visit /robots.txt, /sitemap.xml, and /manifest.webmanifest.
- Check that the production page source contains its unique title, description, canonical URL, Open Graph image, Twitter card, and JSON-LD.
- Confirm an unknown URL returns HTTP 404, not a successful homepage response.
- Share a game URL privately to inspect its social preview; platform caches can take time to refresh.
- Verify **vihar.online** redirects to the canonical **www.vihar.online** address.

## Search visibility

After the custom domain is live, verify ownership in Google Search Console and submit:

~~~text
https://www.vihar.online/sitemap.xml
~~~

This requires access to the owner’s Search Console account and DNS or an approved verification method. The site does not invent a verification token. Indexing timing and search rankings are controlled by search engines, not guaranteed by the code.

The catalogue game page is canonical to **www.vihar.online/games/bap-ka-rasta**. The separate game project controls its own canonical metadata. If its page source still names a former deployment address, update that metadata in the game repository when maintaining it; this catalogue does not rewrite the game application.

## Performance and future integrations

Fonts are local. Newsreader includes only the 400 normal, 500 normal, and 400 italic faces the site uses; DM Sans remains variable. The smaller serif files load when used instead of competing with the hero through unconditional preloads. Images have reserved dimensions and responsive Next.js delivery. The hero loads eagerly with high priority; images below the fold load lazily. Only small navigation and catalogue controls require client-side state. The hero atmosphere is static and motion preferences are respected.

There are no advertising or analytics integrations to configure. If either is introduced, measure again with the real scripts and consent states. Follow the brief’s placement rules, disclose actual providers, and keep game launches independent from those services.

Local browser and Lighthouse results are in [verification history](#historical-reference-preserved-from-the-previous-commit). They are laboratory checks, not real-user Core Web Vitals or certification of every device.


### Archived source: docs/verification.md

# Vihar verification

Verified on **31 October 2026** using **Node.js 22.23.4**, Next.js 16.4.3, and Chrome 156 on Windows. Public pages are prerendered; game engines remain on their independent deployments.

## Production checks

~~~sh
npm ci
npm run assets
npm run check
npm run verify
~~~

Asset generation completed successfully and reproduced the committed artwork, logo masters, icons, fonts, sharing cards, and optimized gameplay captures. ESLint, route type generation, TypeScript, and the production build passed.

The HTTP verifier starts and stops its own production server. It passed checks for all nine public routes, unique titles and descriptions, canonical URLs, Open Graph and Twitter metadata, JSON-LD, internal links, image and font assets, application icons, manifest, robots.txt, sitemap, launch addresses, support email links, response headers, and a genuine HTTP 404 for unknown pages.

Canonical comparisons normalize URLs, so equivalent homepage URLs with and without a trailing slash are accepted. Missing or incorrect canonical URLs still fail verification.

GitHub Actions repeats installation, checks, and production verification on main and pull requests using Node.js 22 on Linux.

## Chrome interaction and layout review

- All nine routes were checked at 320, 390, and 1440 px widths, plus 844 × 390 px landscape.
- The homepage was also reviewed at tablet widths. Images decoded successfully, and no horizontal document overflow was found.
- Keyboard checks covered the first-position skip link, focus transfer to main, mobile navigation, Escape closing and returning focus, route changes, and native Help accordions.
- Catalogue checks covered both availability filters, case-insensitive search, whitespace trimming, the empty state, clearing search, and resetting the collection.
- The coming-soon game has no launch action. Bap Ka Rasta links to its independent HTTPS address in an isolated new tab.
- Reduced-motion preferences disable smooth scrolling and transitions.
- No page errors, console errors, or failed catalogue requests were recorded during the interaction review.

Axe checked all nine pages at a mobile viewport against WCAG A/AA rules and accessibility best practices, including the label-in-name rule. **Zero violations were reported.** Manual keyboard and visual checks supplement this result; automated checks are not a full accessibility certification.

Review screenshots and local HTML/JSON Lighthouse reports are saved in output/playwright/, which is intentionally excluded from Git. The public sharing cards and game screenshots are committed production assets.

## Mobile performance

Lighthouse was run against the production server with its standard simulated mobile network and 4× CPU slowdown. The final scores and metrics are recorded below.

| Audit | Score |
| --- | --- |
| Performance | 91 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

| Metric | Result |
| --- | --- |
| First contentful paint | 1.4 s |
| Largest contentful paint | 3.4 s |
| Total blocking time | 90 ms |
| Cumulative layout shift | 0 |

The final report also passes the text-contrast and label-in-name audits. Local LCP is above the brief's 2.5-second target; that remains an optimization target for measured production performance.

Newsreader now includes only 400 normal, 500 normal, and 400 italic. These files total about **70 KB**, down from about **123 KB** for the previous serif variable fonts. DM Sans remains local and variable. Only DM Sans is unconditionally preloaded; the hero image has high fetch priority and responsive sizing.

These are laboratory measurements, not real-user Core Web Vitals. Measure the deployed site again when traffic is available and before adding analytics or advertising. The brief's 2.5-second LCP goal remains a target rather than a claim of measured field compliance.

## Live hosting

The catalogue was reached over HTTPS at **www.vihar.online**. **vihar.online** returns HTTP 308 to that address, so the website's canonical origin and sitemap follow the existing www configuration. Bap Ka Rasta returned HTTP 200 over HTTPS at **rasta.vihar.online** and was opened through to gameplay during implementation.

The supplied support address is wired across Contact, Help, policies, and the footer. Sending and receiving email requires the owner's mailbox; no test email was sent.

For project settings, domain management, environment variables, and Search Console submission, see [deployment history](#historical-reference-preserved-from-the-previous-commit).


### Archived source: assets/README.md

# Vihar asset register

Source files in this directory are authoring inputs, not public downloads. Optimized production copies live in public/.

| Asset | Source and author/tool | Usage and rights |
| --- | --- | --- |
| Root logo.png | Logo concept supplied by the project owner | Reference for the Vihar emblem and uppercase wordmark; the small vihar.com text in the concept is superseded by the brief’s vihar.online |
| public/brand/*.svg | Original paths authored in scripts/generate-assets.mjs from the supplied concept | Vihar vector masters: horizontal, inverse, stacked, emblem, and monochrome |
| Favicons and application icons | Generated from the Vihar emblem with Sharp | Small-size variant has wider gaps; maskable icon respects a central safe region |
| original/courtyard.svg | Original Vihar illustration authored in the asset generator | Hero artwork: open gateway, player, path, kite, and palms |
| original/playground.svg | Original Vihar illustration authored in the asset generator | Editorial artwork inspired by courtyard play; not a claim to reproduce a historical game board |
| original/ekka-chor.svg | Original Vihar illustration authored in the asset generator | Clearly labelled concept art, not an assertion of approved gameplay or game rules |
| original/bap-ka-rasta-landing.webp | Existing Bap Ka Rasta landing artwork from the owner’s game project | Original generated game concept image; used for the cover, feature, and game sharing card with concept labels |
| original/bap-ka-rasta-gameplay.png | Chrome capture of the owner’s live game at https://rasta.vihar.online | Actual third-person gameplay, 1440 × 900; captured during this implementation |
| original/bap-ka-rasta-camera.png | Chrome capture of the same live game | Actual driver-camera gameplay, 1440 × 900; captured during this implementation |
| public/images/social-*.png | Composed locally from the above assets and Vihar vector logo | 1200 × 630 Open Graph and Twitter sharing cards |
| public/fonts/dm-sans-*.woff2 | DM Sans via @fontsource-variable/dm-sans | SIL Open Font License 1.1; see public/fonts/dm-sans-LICENSE.txt |
| public/fonts/newsreader-*.woff2 | Newsreader 400 normal, 500 normal, and 400 italic via @fontsource/newsreader | SIL Open Font License 1.1; see public/fonts/newsreader-LICENSE.txt |
| Interface icons | lucide-react | ISC; upstream dependency licence applies |

The original project code and assets do not have a general redistribution licence. The owner’s original assets retain their existing ownership. Third-party licence terms apply only to their respective materials.

Sarvam’s live homepage was reviewed in Chrome as a reference for warm gradients, spacious layout, serif typography, and minimal navigation. No Sarvam illustration, logo, copy, or source code is included. All courtyard, card, and play-board compositions were authored for Vihar.

## Reproduction

With Node.js 22 and the locked dependencies installed:

~~~sh
npm run assets
~~~

The script copies licensed font files, writes the logo masters and editable original SVG illustrations, rasterizes WebP artwork, optimizes the saved game captures, and composes sharing cards. It does not contact a remote image generator or recapture the game.

Game captures can become outdated as the independent game changes. To refresh them, launch the current game in Chrome, capture actual third-person and driver-camera views at 1440 × 900, replace the two original PNGs, and run the asset command. Keep concept and gameplay labels accurate.

