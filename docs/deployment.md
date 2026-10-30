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

Local browser and Lighthouse results are in [verification.md](verification.md). They are laboratory checks, not real-user Core Web Vitals or certification of every device.
