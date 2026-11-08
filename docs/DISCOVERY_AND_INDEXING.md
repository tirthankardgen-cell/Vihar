# Game discovery and search indexing

Vihar is a game discovery and publishing platform. VIHAR Originals are made by the VIHAR team. Community Games are published by independent creators and players. Cards, game pages, creator profiles, publishing previews and player activity preserve that distinction.

## Discovery

- `/games` presents collection choices, a horizontal Community Top 5 when rated games exist, and recommendations mixing both origins.
- `/games/originals` contains VIHAR's catalogue and its search, category and availability filters.
- `/games/community` contains published community listings and community search. Listings are rendered on the server for readers and crawlers, then refreshed in the browser.
- Rankings use average rating, then review count, with stable title/ID ties. Only published, rated community games enter the Top 5. Unrated games remain discoverable in recommendations and the community collection.
- Recommendations mix both origins by rating and review count, with unrated games after rated games. This is a discovery selection, not personalized behavioral tracking.
- Carousels use native scrolling and scroll snapping, arrow buttons, visible keyboard focus and reduced-motion support. Their scrollbars are hidden. Touch scrolling remains available on phones and tablets.
- Community play opens a new tab so players can return to review. Existing launch eligibility, review ownership and creator restrictions still apply.

No sample games or placeholder rankings are shipped. Local QA fixtures live only in an isolated Firebase emulator and ignored `output/playwright/` files. Production uses the existing Firebase project.

## Crawlable information

Both collection pages have dedicated canonical URLs, unique metadata, breadcrumbs and CollectionPage/ItemList structured data. Published community pages include VideoGame data and attribute the publisher to their public profile when available. Public profiles and private account pages retain their existing noindex policy.

The XML sitemap includes both collections, substantive public pages and published community games. It includes official artwork, the Vihar logo/favicon, and community cover/screenshot URLs. Daily change-frequency hints express the intended discovery cadence; the sitemap and public listing cache refresh every five minutes. Last-modified values represent actual content changes, not the time a crawler requests a file.

Production robots.txt explicitly allows Bingbot, Googlebot, Googlebot-Image and search/answer crawlers, in addition to its wildcard rule. Images and Next.js image URLs remain crawlable. Preview deployments remain disallowed and noindex. Structured data, visible FAQs and llms.txt describe the same platform behavior without invented reviews, player counts or ranking promises.

## After deployment

1. Verify the canonical `https://vihar.online/sitemap.xml`, `/robots.txt`, `/games/originals`, `/games/community`, `/brand/icon-192.png` and `/indexnow-key.txt` return successful responses.
2. Run `npm run submit:indexnow -- --dry-run` to check the deployed verification key and sitemap. Then run `npm run submit:indexnow` to notify participating search engines, including Bing. The script only submits canonical URLs belonging to this site and never runs during builds. The IndexNow key is public verification material, not a credential.
3. In the verified Google Search Console and Bing Webmaster Tools properties, resubmit the canonical sitemap and inspect affected URLs. Google does not use IndexNow; neither a sitemap nor an accepted submission guarantees indexing, image inclusion or ranking.

For Bing's "page not accessible" error, verify the exact submitted URL, its HTTPS/www redirect chain, DNS and TLS, then check hosting firewall/bot logs for Bing's verified crawler. A successful request with a Bingbot user-agent string does not prove that requests from Bing's own IP addresses are allowed. Do not disable all hosting protections to address an unconfirmed cause.

On 2026-11-08, requests to the production homepage, sitemap, robots file and logo images using Bingbot and Googlebot user agents returned HTTP 200 without an X-Robots-Tag block. An actual Bing crawler denial was not reproduced by those checks.
