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

For project settings, domain management, environment variables, and Search Console submission, see [deployment.md](deployment.md).
