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
