# Third-party notices and asset ownership

The [proprietary notice](LICENSE) covers Vihar’s original materials. It does not replace the licenses of third-party software or assets.

## Bundled fonts and branding assets

| Material | License / notice |
| --- | --- |
| DM Sans | [Bundled SIL Open Font License](public/fonts/dm-sans-LICENSE.txt) |
| Newsreader | [Bundled SIL Open Font License](public/fonts/newsreader-LICENSE.txt) |
| Hind used on the Gulam Chor page | [Bundled SIL Open Font License](public/fonts/gulam-chor/hind-LICENSE.txt) |
| Yatra One used on the Gulam Chor page | [Bundled SIL Open Font License](public/fonts/gulam-chor/yatra-one-LICENSE.txt) |
| Barlow used in Bap Ka Rasta branding | [Bundled font license](public/brand/bap-ka-rasta/BARLOW-LICENSE.txt) |
| Vihar logos, original illustrations, game imagery, and promotional material | Existing rights remain with their respective owners; see [LICENSE](LICENSE) and the asset register in [development.md](development.md) |

Keep font copyright and license files alongside redistributed font material when redistribution is permitted by the applicable license.

## Software dependencies

Runtime dependencies include Next.js, React, Firebase, Motion, and Lucide. Build and development dependencies are recorded in [package.json](package.json); exact resolved versions are recorded in [package-lock.json](package-lock.json). Their accompanying licenses and notices govern those packages, including transitive dependencies. This document is a navigation aid, not a replacement for the complete dependency notices.

Review the installed package licenses before distributing a build or derivative work. Preserve required attribution and notices. A dependency license does not grant permission to reuse Vihar’s own code, trademarks, game assets, or creator-submitted content.

## Adapted interface components

The interactive Vihar ID uses **Flick Card v2.0.0** by **@dorianbaffier**, supplied from [Kokonut UI](https://kokonutui.com) ([source project](https://github.com/kokonut-labs/kokonutui)). The spring, drag, lighting, and card-edge implementation is adapted in `src/components/ui/card-flip.tsx` and its CSS module. Vihar supplies the player faces, responsive layout, and additional interaction handling. The original MIT license follows:

```text
MIT License

Copyright (c) 2025 kokonutUI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Creator content

Creators retain ownership of their games and submitted material, subject to the permissions described in Vihar’s [Terms](https://www.vihar.online/terms). Inclusion in the catalogue does not grant other visitors or contributors permission to copy or republish it.
