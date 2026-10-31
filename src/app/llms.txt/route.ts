import { site } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  return new Response(`# Vihar

> ${site.description}

## Public information
- [Games](${site.url}/games): available and upcoming games.
- [Bap Ka Rasta](${site.url}/games/bap-ka-rasta): early browser driving game, controls and requirements.
- [Game screenshots and map](${site.url}/games/bap-ka-rasta/screenshots): actual gameplay captures and the fictional playable Mumbai map.
- [First-drive guide](${site.url}/guides/bap-ka-rasta-first-drive): gears, routes, cameras, recovery and device settings for the playable build.
- [Help and FAQs](${site.url}/help): answers about downloads, accounts and supported devices.
- [About](${site.url}/about): studio and brand.
- [Contact](${site.url}/contact): support.
- [Privacy](${site.url}/privacy)
- [Terms](${site.url}/terms)

Games are hosted separately. No multiplayer, saved progress or downloadable release is claimed for the current Bap Ka Rasta build.
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
