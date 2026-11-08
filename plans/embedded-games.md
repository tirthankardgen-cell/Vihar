# Vihar Quick Play — implementation specification

Requested by the owner on 2026-11-08. This document specifies future implementation; it does not mean the website integration is already built. Read `development.md` and `AGENTS.md` before implementation. The owner explicitly requested this separate Markdown specification for the implementing agent.

## Goal

Add a **Quick Play** collection for the shared browser-games deployment. Players discover each game inside Vihar, open its individual detail page, and press Play. The game then fills that same page through an iframe. Keep the Vihar URL unchanged when entering play mode. Do not navigate to the games host, open another tab, or embed the games deployment's root catalogue.

The independent games deployment remains responsible for game code and assets. Vihar remains responsible for discovery, detail pages, reviews, account integration and presentation of tracked play activity.

## Deployment address: verify before wiring

The owner's latest spelling is **https://games.vihr.online**. The existing main website is **https://vihar.online**; these are different parent domains. Earlier discussion used games.vihar.online. Do not silently substitute one for the other. Confirm the intended host and obtain its actual game route manifest from the games agent before enabling listings. This specification records the latest supplied address, not a verified deployment.

Each iframe must load a verified individual game URL, never the host root. Route examples such as `/chess` and `/ludo` are illustrative until confirmed. Do not construct paths from display names and assume they exist.

## Initial collection: twelve games

Use this initial roster from the owner's game-folder list. Confirm actual deployed availability and supported modes before publishing; do not advertise unfinished functionality.

| Game | Suggested stable identifier | Genre |
| --- | --- | --- |
| Billiards | billiards | Board & Table |
| Carrom | carrom | Board & Table |
| Checkers | checkers | Board & Table |
| Chess | chess | Board & Table |
| Connect Four | connect-four | Board & Table |
| Ludo | ludo | Board & Table |
| Memory Match | memory-match | Puzzles & Quick Play |
| Minesweeper | minesweeper | Puzzles & Quick Play |
| Reversi | reversi | Board & Table |
| Snakes and Ladders | snakes-and-ladders | Board & Table |
| Sudoku | sudoku | Puzzles & Quick Play |
| Tic-Tac-Toe | tic-tac-toe | Puzzles & Quick Play |

Quick Play is a collection, not a replacement for VIHAR Originals / Community Games provenance. Preserve both existing origin distinctions and ordinary genre filters. Mode badges (Solo, Pass & Play, Online Rooms) must reflect verified support per game.

Keep Bap Ka Rasta independent with its existing rich detail page. Keep Gulam Chor's existing page, identity and deployment intact; it can be cross-listed under Cards / Board & Table when appropriate. Do not count Gulam Chor among the twelve or migrate it as part of this task without a separate decision.

## Player flow and page states

1. **Discover:** show the Quick Play section in the catalogue, with one card per released game. Cards open their own Vihar detail URL in the current tab, for example `/games/chess`. Reuse current navigation, game-card styling and responsive behaviour.
2. **Detail:** use a shared data-driven page template, not twelve copied page implementations. Show title, cover, accurate description, controls, supported devices and modes, Play button, existing review/rating interface and appropriate activity/statistics. This state has Vihar's normal header and footer.
3. **Play:** pressing Play changes local page state without changing the Vihar address. Hide the entire Vihar site chrome: header, footer, promotional sections, detail content and reviews. Mount only the selected game's iframe in the available viewport. Do not load the iframe until requested. The game must show its own usable controls/menu.
4. **Exit:** provide an accessible Exit to Vihar action in the embedded game's menu. It sends a validated exit event to the parent, which ends/pauses the session, unmounts the iframe, restores the detail page and returns keyboard focus to Play. Provide an Escape-key integration and a minimal accessible recovery/exit control if the game fails to load; do not trap users in an empty frame. Coordinate exit support with the game agent before release.
5. **Failure:** show an actionable loading/error state with Retry and Back to details. An iframe load event alone is not proof the game is ready; use a ready handshake and bounded timeout. No forced new-tab fallback.

Play mode means viewport-filling layout, not automatically invoking the browser Fullscreen API. True fullscreen is optional and user-triggered. Support mobile dynamic viewport height, safe areas, touch input, landscape/portrait changes and keyboard focus. Restore scrolling on exit.

Use the existing site-frame architecture to suppress chrome only while this player is active; do not hide global elements permanently or affect unrelated routes. Reloading a detail URL may return to its ordinary detail state. Browser Back must remain usable; do not install navigation traps.

## Game registry and detail metadata

Maintain one typed registry containing stable ID, display title, verified HTTPS embed URL, exact allowed origin, provenance, genre, supported modes/devices, artwork, description, instructions and release status. Keep game IDs stable across title or host changes and map to the existing Vihar game identifiers rather than creating duplicate statistics records.

Individual detail pages should have unique titles, descriptions and canonical Vihar URLs, accurate structured data where appropriate, and server-rendered helpful text. Add released public detail URLs to XML/HTML sitemaps and discovery links. Do not claim indexed status or manufacture reviews, player counts, scores or last-modified dates.

## Existing Vihar ID, tracking and reviews

Inspect and reuse the existing SDK at `public/sdk/vihar-id.js`, protocol/service modules under `src/lib/vihar-id/`, play links and current review components. The site already distinguishes website opens from reported play time; an iframe launch must not silently replace active-play tracking with page-open duration.

- Preserve registered game identity and permitted origins. Embedding does not automatically authenticate a player on another origin.
- Coordinate iframe-safe login and launch with the games agent. Existing launch tickets, popup consent, PKCE and scoped credentials must retain their protections. Never send Firebase credentials, passwords or durable bearer tokens through query strings or unrestricted messages. Do not invent a second identity protocol.
- Start tracked play when gameplay begins, not while loading, waiting in a lobby or reading menus. Reuse SDK startSession, setPlaying, stopSession and visibility handling. Pause/end on exit, navigation and hidden/inactive states according to the existing server accounting rules.
- If the game already reports through the SDK, the Vihar wrapper must not also report duplicate sessions or heartbeats. Agree one reporting owner: the game SDK for gameplay lifecycle.
- Preserve guest play. Only associate activity with an authenticated account through the approved existing flow. Shared-device pass-and-play is not proof that every local player owns the signed-in account.
- Attach reviews and aggregate statistics to the same stable game identity as the listing. Reuse existing authentication, authorization and moderation rules. Reviews appear in the detail state, not over active gameplay.
- Browser-reported play time and results are not authoritative evidence for valuable rewards or competitive rankings.

## Parent–iframe contract

Agree a versioned interface with the game agent before implementation: ready, loading failure, exit request, and any necessary visibility/pause coordination. These UI events complement the existing tracking SDK; they do not replace its authenticated API.

For every incoming message validate `event.origin` against the selected game's exact allowed origin, `event.source` against that iframe's contentWindow, and the message version/type/schema and expected game/session identifiers. Send using an exact targetOrigin, never `*`. Do not accept arbitrary embed URLs supplied by query parameters or untrusted messages.

The games host must allow framing specifically by https://vihar.online using CSP frame-ancestors and must not emit conflicting X-Frame-Options DENY/SAMEORIGIN. Review Vihar's frame-src policy if present. Vihar's own frame-ancestors protection concerns other sites framing Vihar and should not be removed just to embed games.

Use a titled iframe and only the permissions and sandbox capabilities actually needed by the game and login flow. Test popup sign-in, storage restrictions and fullscreen across browsers; do not assume third-party cookies or browser storage work because a standalone game works. Do not reuse this trusted first-party-games configuration for arbitrary community uploads.

## Responsibilities

**Games agent:** supply the verified deployment origin and per-game route manifest, truthful mode/asset metadata, iframe-ready responsive gameplay, ready/exit messaging, existing Vihar SDK integration and any game-owned room backend. Each URL must work directly and load only the selected game's necessary assets.

**Vihar agent:** implement the registry, Quick Play discovery, shared detail template, viewport player and chrome restoration, validated parent messaging, review/statistics integration, metadata/sitemaps and failure handling. Keep independently deployed games operational.

Online rooms need working backend state, authorization and reconnect handling; an iframe or Vercel frontend deployment alone does not provide multiplayer. List a mode only when implemented and tested.

## Acceptance checklist

- Confirm exact host spelling and all twelve real game paths; exclude unavailable releases rather than linking broken placeholders.
- Each card opens its individual Vihar detail page in the same tab, with accurate content, metadata and working reviews.
- Play keeps the Vihar URL unchanged, embeds the selected game rather than the host root, and shows no Vihar header/footer/detail content.
- Loading, ready, error, retry, exit, focus restoration and browser navigation work on desktop and phone. No invisible leftover game continues running after exit.
- Game assets are loaded on demand. No cross-game asset download or duplicate heartbeat/session accounting is introduced.
- Test guest and signed-in play, popup consent, hidden tabs, pause, resume, exit, reload and interrupted sessions against existing tracking behaviour. Verify activity reaches the correct account/game.
- Test invalid origins/messages and blocked embeds; do not loosen global authentication or Firestore rules to bypass failures.
- Run relevant existing unit tests, build, HTTP verification, browser checks and `npm run check:log`. Update `development.md` with actual results and known limitations.
- Push to main only after validation and within the owner's authorization. A source push does not prove production deployment succeeded.

## Current delivery scope

This commit delivers this implementation specification only. It does not create twelve listings, change site chrome, enable iframe gameplay or verify the supplied games host. The implementation agent must resolve the exact host/routes and inspect the current code before making those changes.
