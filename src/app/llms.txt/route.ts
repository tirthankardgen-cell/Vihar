import { site } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  return new Response(`# Vihar

> ${site.description}

## Public information
- [Site map](${site.url}/site-map): all public pages and game resources.
- [Games](${site.url}/games): available and upcoming games.
- [Bap Ka Rasta](${site.url}/games/bap-ka-rasta): early browser driving game, controls and requirements.
- [Game gallery](${site.url}/games/bap-ka-rasta/screenshots): gameplay, playable Mumbai map, character models, landmark renders, and city and vehicle concept previews.
- [First-drive guide](${site.url}/guides/bap-ka-rasta-first-drive): gears, routes, cameras, recovery and device settings for the playable build.
- [Help and FAQs](${site.url}/help): answers about downloads, accounts and supported devices.
- [About](${site.url}/about): studio and brand.
- [Contact](${site.url}/contact): support.
- [Privacy](${site.url}/privacy)
- [Terms](${site.url}/terms)
- [Play Bap Ka Rasta](${site.gameUrl}): the independent playable game.
- [Game world and controls](${new URL("/guide.html", site.gameUrl).href}): current cities, vehicles, characters, landmarks and credits.

Games are hosted separately. No multiplayer, saved progress or downloadable release is claimed for the current Bap Ka Rasta build.
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
