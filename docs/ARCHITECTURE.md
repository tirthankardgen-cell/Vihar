# Architecture

## Application boundaries

Vihar is a Next.js App Router website with React and TypeScript. Server-rendered pages provide editorial content and public listing metadata; client components handle account state, publishing, and interactive feedback. Firebase Authentication supplies identity and Firestore stores account and community records. The browser uses Firebase web configuration, not an Admin SDK credential.

Vihar’s catalogue and creator studio are separate from game hosting. Game and download links open the creator’s host. Cover and screenshot URLs are rendered directly in the visitor’s browser with image-failure fallbacks. The publishing flow does not upload game binaries or image files to Vihar Storage.

## Main routes

| Route | Responsibility |
| --- | --- |
| `/` and `/games` | Discovery and curated game catalogue |
| `/games/{slug}` | Curated Vihar game details |
| `/community/{id}` | Published creator listing or authorized draft preview |
| `/dashboard` | Signed-in player workspace |
| `/dashboard/publish` | Creator editor, content management, and analytics |
| `/u/{username}` | Public player profile |
| `/sitemap.xml` and `/site-map` | Canonical pages and published community discovery |

## Publishing and feedback

The editor collects details, images and play instructions, previews the page, then saves visibility. Drafts are private to their owner. Published listings are discoverable. The editor requires a cover and play guide for publication; optional fields remain backward compatible with older records.

| Data | Role |
| --- | --- |
| `profiles/{uid}` and `usernames/{username}` | Public identity and unique username allocation |
| `players/{uid}/favorites/{gameId}` | Private favourites |
| `players/{uid}/activity/{eventId}` | Private immutable website opens with server timestamps |
| `friendships/{id}` | Participant-scoped requests and connections |
| `communityGames/{id}` | Owner-managed draft or published listing |
| `communityGames/{id}/players/{uid}` | Immutable signed-in launch receipt |
| `communityGames/{id}/reviews/{uid}` | One editable review per eligible player |
| `officialGames/{id}/players/{uid}` and `reviews/{uid}` | Equivalent launch/review records for allowed released Vihar games |
| `profiles/{uid}/stats/{gameId}` | Game statistics reserved for trusted backend writers |

Firestore rules enforce schema, ownership, publication visibility, and review eligibility. Clients cannot rewrite receipt counters or award themselves trusted game statistics. Official game IDs must also be allowed in the rules; adding a catalogue entry alone does not enable reviews.

“Unique game opens” means distinct signed-in accounts that opened a game or download page from Vihar, excluding the creator. These are browser-originated signals, not proof of gameplay. Rating badges use aggregate reads; review panels subscribe to feedback updates. Creators cannot edit other players’ reviews. Each signed-in launch atomically creates a private activity event and, when absent, the first-launch receipt. The dashboard subscribes to the last 365 UTC days of events; repeat launches count as separate opens. Opens are never added to trusted sessions or play time. Guest sign-in continuity restores only review eligibility, not dated activity. Account exports include the full private activity history.

## Public data and search

Public community content uses Firestore REST reads subject to the same access rules. Server-rendered titles and descriptions support canonical metadata. Sitemap data refreshes every five minutes and uses actual edit timestamps. If community reads fail, sitemap generation preserves core pages and retries on revalidation. Neither metadata nor sitemap freshness guarantees search indexing.

## Interface and operations

The dashboard preserves Vihar’s charcoal and amber theme. On desktop, navigation and content scroll independently below the header. Mobile uses document scrolling. Route changes reset the content pane, and dashboard routes omit the shared footer.

Production builds use Vercel. Firebase rules and hosting are separate deployment surfaces. See [Deployment](DEPLOYMENT.md), [Security](../SECURITY.md), and the detailed [developer guide](../developer.md).
