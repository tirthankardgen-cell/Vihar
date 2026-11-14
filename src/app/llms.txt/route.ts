import { helpArticles } from "@/lib/help";
import { site } from "@/lib/site";
import { quickPlayGames, quickPlayModes } from "@/lib/quick-play";
export const dynamic = "force-static";
export function GET() {
  return new Response(`# Vihar

> ${site.description}

## What Vihar is
Vihar is a game discovery and publishing platform, rooted in India and open to players and independent creators. Players discover games, explore the publisher’s profile, play on the game’s own website, and return to leave a rating and written review or feedback. Creators publish listings for their self-hosted browser or downloadable games and read player feedback.

## Who publishes the games
- VIHAR Originals are created by the VIHAR team. Bap Ka Rasta and Gulam Chor belong to this collection.
- Community Games are published by independent creators and players. The Community Game badge identifies these listings; the publisher’s profile is linked when available. Community submissions are not presented as VIHAR creations.
- Quick Play is a collection of 24 VIHAR board games, puzzles and arcade games, with new games every week. Each has its own Vihar page. Unreleased games are marked Coming soon; only verified releases can play inside that page. Game code stays on games.vihar.online.
- Community rankings use real player ratings, with review count as the tie-breaker. Unrated games do not receive a rank. Recommendations are discovery selections, not a claim of personalized tracking.
- Reviews include a star rating and written comments or feedback. A signed-in player must open a game from Vihar before posting a review; a community publisher cannot review their own game.

## Vihar ID for community games
A community game that uses login or saved player progress must offer Sign in with Vihar ID on the studio’s own website. A game without either can start directly. All new published community games must test gameplay reporting. Account identity and game-scoped cloud saves require player approval; direct-play launch tickets permit activity only. Private activity, sessions and saves appear in the player dashboard. The SDK is available at ${site.url}/sdk/vihar-id.js.

## Playable Quick Play games
${quickPlayGames.filter((game) => game.release.status === "playable").map((game) => `- [${game.title}](${site.url}/games/${game.id}): ${game.about} Modes: ${game.release.status === "playable" ? game.release.modes.map((mode) => quickPlayModes[mode]).join(", ") : ""}.`).join("\n")}
These games are free browser games with guest play and no download. Signed-in launches can record account activity and enable reviews. Use Exit to Vihar or Escape to return to the game details. Private online rooms are coming soon; local Pass & Play means sharing one device.

## Step-by-step help
${helpArticles.map((article) => `- [${article.title}](${site.url}/help/${article.slug}): ${article.description}`).join("\n")}

## Public information
- [Site map](${site.url}/site-map): all public pages and game resources.
- [Games](${site.url}/games): game discovery, community rankings and recommended games.
- [VIHAR Originals](${site.url}/games/originals): games created by the VIHAR team.
- [Community Games](${site.url}/games/community): published games by independent creators and players.
- [Quick Play](${site.url}/games/quick-play): board and tabletop favourites, puzzles, release status and individual game pages.
- [Share your game](${site.url}/dashboard/publish): sign in to submit a self-hosted game URL and track unique player opens and reviews.
- [Instagram](${site.instagram}): official Vihar World profile.
- [Bap Ka Rasta](${site.url}/games/bap-ka-rasta): free-roaming driving game inspired by Indian cities, with a growing city and vehicle line-up, controls and requirements.
- [Gulam Chor](${site.url}/games/gulam-chor): playable Indian family card game, illustrated courtyard, virtual family, house rules and actual gameplay screenshots.
- [Play Gulam Chor](${site.gulamChorUrl}): free browser preview; you and 1–5 virtual players, not online multiplayer.
- [Game gallery](${site.url}/games/bap-ka-rasta/screenshots): gameplay, playable Mumbai map, character models, landmark renders, and city and vehicle concept previews.
- [First-drive guide](${site.url}/guides/bap-ka-rasta-first-drive): gears, routes, cameras, recovery and device settings for the playable build.
- [Help and FAQs](${site.url}/help): answers about downloads, accounts and supported devices.
- [About](${site.url}/about): platform, community and brand.
- [Contact](${site.url}/contact): support.
- [Privacy](${site.url}/privacy)
- [Terms](${site.url}/terms)
- [Play Bap Ka Rasta](${site.gameUrl}): the separately hosted VIHAR Original.
- [Game world and controls](${new URL("/guide.html", site.gameUrl).href}): current cities, vehicles, characters, landmarks and credits.

Games are hosted separately. No multiplayer, saved progress or downloadable release is claimed for the current Bap Ka Rasta build.
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
