import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (...parts) => path.join(root, ...parts);
await Promise.all(["public/images", "public/fonts", "public/brand", "assets/original"].map((dir) => mkdir(at(dir), { recursive: true })));

for (const [packageName, source, target] of [
  ["@fontsource-variable/dm-sans", "files/dm-sans-latin-wght-normal.woff2", "dm-sans-latin.woff2"],
  ["@fontsource/newsreader", "files/newsreader-latin-400-normal.woff2", "newsreader-latin.woff2"],
  ["@fontsource/newsreader", "files/newsreader-latin-500-normal.woff2", "newsreader-latin-medium.woff2"],
  ["@fontsource/newsreader", "files/newsreader-latin-400-italic.woff2", "newsreader-latin-italic.woff2"],
]) await copyFile(at("node_modules", packageName, source), at("public/fonts", target));
for (const [packageName, target] of [["@fontsource-variable/dm-sans", "dm-sans"], ["@fontsource/newsreader", "newsreader"]]) {
  await copyFile(at("node_modules", packageName, "LICENSE"), at("public/fonts", `${target}-LICENSE.txt`));
}

const emblem = (ink = "#26272C", dot = "#C77B53") => `<g fill="${ink}"><path d="M44 3 12 25C5 30 2 36 2 45v43l14-5V45c0-5 2-8 6-11l22-15V3ZM52 3l32 22c7 5 10 11 10 20v43l-14-5V45c0-5-2-8-6-11L52 19V3Z"/><path d="M19 43h10c4 0 7 2 9 6l10 25 10-25c2-4 5-6 9-6h10L55 96H41L19 43Z"/></g><circle cx="48" cy="42" r="7.5" fill="${dot}"/>`;
const wordmark = (ink = "#26272C") => `<g fill="${ink}" fill-rule="evenodd"><path d="M0 0h5l7 18L19 0h5L14 25h-4L0 0Z"/><path d="M34 0h5v25h-5Z"/><path d="M50 0h5v10h13V0h5v25h-5V14H55v11h-5Z"/><path d="M94 0h5l11 25h-5l-2.5-6h-12L88 25h-5L94 0Zm-1.8 15h8.6L96.5 4.5 92.2 15Z"/><path d="M120 0h12c7 0 10 3 10 8 0 4-2 6.5-6 7.5l8 9.5h-6l-7-9h-6v9h-5V0Zm5 4v8h7c3 0 5-1.2 5-4s-2-4-5-4h-7Z"/></g>`;
const svg = (viewBox, content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`;
const logo = (ink, dot) => svg("0 0 284 64", `<g transform="translate(2 2) scale(.62)">${emblem(ink, dot)}</g><g transform="translate(84 17) scale(1.34)">${wordmark(ink)}</g>`);
await writeFile(at("public/brand/vihar-horizontal.svg"), logo("#26272C", "#C77B53"));
await writeFile(at("public/brand/vihar-horizontal-inverse.svg"), logo("#FAF9F6", "#C77B53"));
await writeFile(at("public/brand/vihar-emblem.svg"), svg("-8 -5 112 112", emblem()));
await writeFile(at("public/brand/vihar-emblem-monochrome.svg"), svg("-8 -5 112 112", emblem("#26272C", "#26272C")));
await writeFile(at("public/brand/vihar-emblem-inverse.svg"), svg("-8 -5 112 112", emblem("#FAF9F6", "#C77B53")));
await writeFile(at("public/brand/vihar-stacked.svg"), svg("0 0 400 340", `<g transform="translate(144 22) scale(1.16)">${emblem()}</g><g transform="translate(90 160) scale(1.53)">${wordmark()}</g><text x="200" y="242" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" letter-spacing="3" fill="#26272C">A space to play.</text>`));

// Derive icons from the owner's actual pixels, never a redrawn or stretched mark.
// The 368px square contains the full central emblem, excluding text and samples.
const emblemPixels = await sharp(at("logo.png"))
  .extract({ left: 584, top: 160, width: 368, height: 368 }).png().toBuffer();
const iconPngs = await Promise.all([16, 32, 48].map((size) => sharp(emblemPixels).resize(size, size, { fit: "contain" }).png().toBuffer()));
const icoHeader = Buffer.alloc(6 + iconPngs.length * 16);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(iconPngs.length, 4);
let offset = icoHeader.length;
for (let i = 0; i < iconPngs.length; i++) {
  const start = 6 + i * 16;
  icoHeader[start] = [16, 32, 48][i]; icoHeader[start + 1] = [16, 32, 48][i];
  icoHeader.writeUInt16LE(1, start + 4); icoHeader.writeUInt16LE(32, start + 6);
  icoHeader.writeUInt32LE(iconPngs[i].length, start + 8); icoHeader.writeUInt32LE(offset, start + 12);
  offset += iconPngs[i].length;
  await writeFile(at(`public/brand/favicon-${[16, 32, 48][i]}.png`), iconPngs[i]);
}
await writeFile(at("public/favicon.ico"), Buffer.concat([icoHeader, ...iconPngs]));
for (const [size, target] of [[180, "apple-touch-icon.png"], [192, "brand/icon-192.png"], [512, "brand/icon-512.png"], [512, "brand/vihar-avatar.png"]]) {
  await sharp(emblemPixels).resize(size, size, { fit: "contain" }).png().toFile(at("public", target));
}
await sharp(emblemPixels).resize(320, 320).extend({ top: 96, bottom: 96, left: 96, right: 96, background: "#FAF9F6" }).png().toFile(at("public/brand/maskable-512.png"));

const atmosphere = `<defs>
  <radialGradient id="glow"><stop stop-color="#F5AE77" stop-opacity=".65"/><stop offset="1" stop-color="#F8BA84" stop-opacity="0"/></radialGradient>
  <radialGradient id="lilac"><stop stop-color="#B5ADE3" stop-opacity=".5"/><stop offset="1" stop-color="#C7C3EC" stop-opacity="0"/></radialGradient>
  <linearGradient id="sun" x2=".7" y2="1"><stop stop-color="#EEAF79"/><stop offset="1" stop-color="#CD7754"/></linearGradient>
  <linearGradient id="stone" x2=".7" y2="1"><stop stop-color="#F9F1DF"/><stop offset="1" stop-color="#EBD9BE"/></linearGradient>
  <linearGradient id="stoneSide" x2="1" y2=".5"><stop stop-color="#C2AD93"/><stop offset="1" stop-color="#E6D3B6"/></linearGradient>
  <linearGradient id="archFace" x2=".25" y2="1"><stop stop-color="#FFFAEE"/><stop offset="1" stop-color="#F1DEC2"/></linearGradient>
  <linearGradient id="floor" x2="1" y2="1"><stop stop-color="#D3CCE6"/><stop offset="1" stop-color="#A39ABB"/></linearGradient>
  <linearGradient id="terra" x2=".7" y2="1"><stop stop-color="#DBA17B"/><stop offset="1" stop-color="#B76C51"/></linearGradient>
  <linearGradient id="sage" x2="1" y2="1"><stop stop-color="#8C9B79"/><stop offset="1" stop-color="#4F6654"/></linearGradient>
  <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="17"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".025"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in" result="maskedNoise"/><feBlend in="SourceGraphic" in2="maskedNoise" mode="multiply"/></filter>
</defs>`;

const palm = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0c5-66-4-99-13-135" fill="none" stroke="#917356" stroke-width="7"/><g fill="url(#sage)"><path d="M-13-133c-12-38-68-40-83-20 41-5 62 16 83 20Z"/><path d="M-13-133c-49-18-73 7-76 36 23-20 48-23 76-36Z"/><path d="M-13-133c-37 0-43 31-35 55 4-27 21-33 35-55Z"/><path d="M-13-133c13-45 45-41 63-28-33 7-41 15-63 28Z"/><path d="M-13-133c35-28 70-13 76 10-27-14-49-4-76-10Z"/><path d="M-13-133c42-9 57 16 53 45-10-25-26-33-53-45Z"/><path d="M-13-133c-8-37 8-55 28-63-13 24-14 44-28 63Z"/></g></g>`;

const courtyard = svg("0 0 1100 1100", `${atmosphere}
  <ellipse cx="640" cy="390" rx="420" ry="410" fill="url(#glow)"/>
  <ellipse cx="560" cy="700" rx="560" ry="380" fill="url(#lilac)"/>
  <circle cx="706" cy="266" r="102" fill="url(#sun)"/>
  <path d="M126 361c50-35 104-45 171-14M826 450c42-18 82-18 122-3" stroke="#C7B9AF" fill="none" stroke-width="1.4" opacity=".6"/>
  <g filter="url(#grain)">
    <ellipse cx="573" cy="877" rx="322" ry="59" fill="#5C5267" opacity=".17" filter="url(#softShadow)"/>
    <path d="m160 721 410-188 402 209-411 205Z" fill="url(#floor)"/>
    <path d="m160 721 401 207v19L160 740Z" fill="#968AA8"/>
    <path d="m561 928 411-205v19L561 947Z" fill="#877B9E"/>
    <g stroke="#F6F0F1" stroke-width="1.2" opacity=".46">
      <path d="m211 745 410-187M261 771l410-186M311 797l410-185M361 823l410-184M411 849l410-183M461 875l410-182M511 901l410-181"/>
      <path d="m210 698 402 209M261 674l402 209M312 651l402 209M364 627l402 209M416 604l402 209M467 580l402 209M519 557l402 209"/>
    </g>
    <path d="m333 856 77-35 221-108-65-32-83 39-70-35 136-64 194 98-265 132-76 41Z" fill="#D9A085"/>
    <path d="m368 838 56-23 220-107-78-39" fill="none" stroke="#EAC0A5" stroke-width="2"/>
    <path d="m654 583 66-31 66 34-65 33Z" fill="#DED5E8"/>
    <path d="m721 619 65-33v24l-65 34Z" fill="#9E93B3"/>
    <path d="m654 583 67 36v25l-67-36Z" fill="#B6AACB"/>
    <path d="m408 663 18 10V424c0-141 110-180 187-120l32 25c45 35 71 83 71 145v225l-31 14V477c0-74-38-133-92-151-62-21-139 24-139 112v213l-28 22Z" fill="url(#stoneSide)"/>
    <path d="M385 650V428c0-147 115-195 218-117 48 36 81 95 81 166v238l-64-33V460c0-54-22-95-58-118-54-34-112-8-112 72v270l-65-34Z" fill="url(#archFace)"/>
    <path d="m450 684 25-12V426c0-54 18-84 47-87-42-1-72 25-72 75v270Z" fill="#B5A185"/>
    <path d="m385 650 65 34 25-12-63-33Z" fill="#E5D0B4"/>
    <path d="m620 682 64 33 31-16-64-33Z" fill="#DAC4A7"/>
    <path d="M397 648V428c0-133 104-179 198-107" fill="none" stroke="#FFFEF7" stroke-width="2.5" opacity=".7"/>
    <path d="m451 682 168-82 65 115-141 65Z" fill="#635366" opacity=".15"/>
    <path d="m670 791 131-63 111 58-132 65Z" fill="#B76C51"/>
    <path d="m670 774 131-63 111 58-132 65Z" fill="url(#terra)"/>
    <path d="m670 774 110 60v17l-110-60Z" fill="#C78B6C"/>
    <path d="m694 749 107-51 88 45-110 54Z" fill="#DCA584"/>
    <path d="m694 736 107-51 88 45-110 54Z" fill="#E5B392"/>
    <path d="m694 736 85 48v13l-85-48Z" fill="#C38A6C"/>
    <path d="m719 712 81-38 63 33-81 39Z" fill="#EABE9D"/>
    <path d="m719 700 81-38 63 33-81 39Z" fill="#F0CAAA"/>
    <path d="m719 700 63 34v12l-63-34Z" fill="#CD9674"/>
    <ellipse cx="817" cy="645" rx="41" ry="19" fill="#786878" opacity=".18"/>
    <path d="M789 597h53l-8 48c-11 9-26 9-37 0Z" fill="url(#terra)"/>
    <ellipse cx="816" cy="597" rx="27" ry="11" fill="#B97452"/>
    ${palm(817, 601, .95)}
    <ellipse cx="285" cy="704" rx="43" ry="15" fill="#685D74" opacity=".17"/>
    <path d="M257 656h55l-9 48c-11 9-26 9-36 0Z" fill="url(#stone)"/>
    <ellipse cx="284" cy="656" rx="27.5" ry="10" fill="#BFAA8D"/>
    ${palm(284, 661, .74)}
    <ellipse cx="550" cy="815" rx="18" ry="8" fill="#73627D" opacity=".2"/>
    <path d="M539 792c0-15 3-24 11-24s12 9 12 24v16c-7 8-16 8-23 0Z" fill="#C77B53"/>
    <circle cx="550" cy="757" r="12" fill="#DCA680"/>
    <ellipse cx="350" cy="744" rx="19" ry="9" fill="#867895" opacity=".2"/>
    <path d="M335 726c0-11 7-17 16-17s15 6 15 17v9c-9 8-22 8-31 0Z" fill="#B5C5A4"/>
    <ellipse cx="351" cy="711" rx="14" ry="6" fill="#C8D5BA"/>
  </g>
  <g transform="translate(863 269) rotate(18)"><path d="m0-51 40 51-40 47-40-47Z" fill="#B7AECC"/><path d="m0-51 0 98 40-47Z" fill="#8E83A9"/><path d="M-40 0h80M0-51v98" fill="none" stroke="#E7DDEF" stroke-width="1.3"/><path d="M0 47c-53 45 37 52-17 98-23 20-40 24-31 63" fill="none" stroke="#A9949B" stroke-width="1.3"/><path d="m-15 97-17 4 13 12 4-16Zm-28 77-13 8 16 7-3-15Z" fill="#C88161"/></g>
  <g stroke="#9C836E" stroke-width="1.5" fill="none" opacity=".75"><path d="M314 209v19m-9-9h19M905 609v16m-8-8h16"/><path d="M209 508c9-9 18-9 27 0 9-9 18-9 27 0"/></g>
`);

const card = (x, y, rotation, symbol, colour) => `<g transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-91" y="-124" width="200" height="284" rx="17" fill="#625475" opacity=".14" transform="translate(16 21)"/><rect x="-100" y="-140" width="200" height="280" rx="15" fill="#F9F4E7" stroke="#E0D7C5" stroke-width="2"/><rect x="-85" y="-125" width="170" height="250" rx="9" fill="none" stroke="#D7CAB5"/><text x="-68" y="-88" font-family="Georgia,serif" font-size="34" fill="${colour}">A</text><text x="68" y="111" transform="rotate(180 68 100)" font-family="Georgia,serif" font-size="34" fill="${colour}">A</text><text y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="114" fill="${colour}">${symbol}</text><path d="M-55-61h110M-55 76h110" stroke="#D5C7AD" stroke-width="1"/></g>`;
const gulamChor = svg("0 0 1200 900", `${atmosphere}<rect width="1200" height="900" fill="#D8D1E8"/><ellipse cx="980" cy="85" rx="680" ry="580" fill="#EAE2ED"/><path d="M0 785 1200 435v465H0Z" fill="#B6ACCA" opacity=".42"/><g filter="url(#grain)"><ellipse cx="611" cy="620" rx="328" ry="80" fill="#746283" opacity=".14" filter="url(#softShadow)"/><circle cx="174" cy="223" r="77" fill="none" stroke="#B7AAC6"/><circle cx="174" cy="223" r="62" fill="none" stroke="#B7AAC6"/>${card(457, 446, -22, "♣", "#393642")}${card(625, 433, -2, "♦", "#B9674C")}${card(790, 457, 20, "♠", "#393642")}<ellipse cx="367" cy="684" rx="42" ry="21" fill="#655068" opacity=".16"/><path d="M328 654v24c0 30 79 30 79 0v-24Z" fill="#B97858"/><ellipse cx="367" cy="654" rx="40" ry="23" fill="#D39870"/><ellipse cx="367" cy="654" rx="29" ry="16" fill="none" stroke="#E2B690"/><path d="M881 674v18c0 21 60 21 60 0v-18Z" fill="#899377"/><ellipse cx="911" cy="674" rx="30" ry="17" fill="#B2BE9D"/></g><g stroke="#A189A4" stroke-width="1.4"><path d="M998 214v26m-13-13h26M236 547v20m-10-10h20"/></g>`);

let tiles = "";
for (let row = 0; row < 7; row++) for (let col = 0; col < 7; col++) {
  if (row < 2 && (col < 2 || col > 4) || row > 4 && (col < 2 || col > 4)) continue;
  const colour = (row + col) % 2 === 0 ? "#EDE5D1" : "#CCBBA1";
  tiles += `<rect x="${col * 46}" y="${row * 46}" width="45" height="45" fill="${colour}" stroke="#AB967E" stroke-width=".6"/>`;
}
const playground = svg("0 0 960 960", `${atmosphere}<rect width="960" height="960" rx="30" fill="#E7E3EE"/><circle cx="726" cy="253" r="118" fill="#D6C9DF"/><path d="M0 728 960 410v550H0Z" fill="#D5CCE0"/><g filter="url(#grain)"><ellipse cx="499" cy="684" rx="273" ry="71" fill="#76657C" opacity=".14" filter="url(#softShadow)"/><path d="M209 580 498 441 791 591 502 739Z" fill="#B7A3BB"/><path d="m209 580 293 151v18L209 597Z" fill="#AD9BAF"/><path d="m502 731 289-140v17L502 749Z" fill="#8C809D"/><g transform="translate(499 423) matrix(.91 .465 -.91 .465 0 0)">${tiles}</g><path d="M216 490v72l73 38v-72Z" fill="#C48C70"/><path d="m216 490 29-14 73 38-29 14Z" fill="#EBC5A3"/><path d="m289 528 29-14v72l-29 14Z" fill="#B97D64"/><path d="M250 493V390c0-111 84-142 158-87 35 26 59 67 59 119v130l-43-23V410c0-38-16-67-42-84-37-24-80-6-80 51v143l-52-27Z" fill="url(#archFace)"/><path d="m302 520 20-10V385c0-42 8-63 23-68-28 4-43 24-43 60Z" fill="#BCAA93"/><path d="m467 552 19-11V420c0-109-83-164-159-139 79-14 140 53 140 141Z" fill="#CDB699"/><g fill="#C47E5B"><ellipse cx="489" cy="574" rx="20" ry="10"/><path d="M469 560v14c0 13 40 13 40 0v-14Z"/><ellipse cx="489" cy="560" rx="20" ry="10" fill="#DDA681"/><circle cx="489" cy="545" r="15" fill="#D0926C"/></g><g transform="translate(76 33)" fill="#717B69"><path d="M469 560v14c0 13 40 13 40 0v-14Z"/><ellipse cx="489" cy="560" rx="20" ry="10" fill="#A7B494"/><circle cx="489" cy="545" r="15" fill="#91A07F"/></g><g transform="translate(-19 64)" fill="#A697B4"><path d="M469 560v14c0 13 40 13 40 0v-14Z"/><ellipse cx="489" cy="560" rx="20" ry="10" fill="#CCC0D5"/><circle cx="489" cy="545" r="15" fill="#B9AAC6"/></g><path d="M693 623h50l-7 39c-9 8-25 8-36 0Z" fill="url(#terra)"/><ellipse cx="718" cy="623" rx="25" ry="9" fill="#A76D52"/>${palm(718, 629, .73)}<g transform="translate(698 275) rotate(21)"><path d="m0-71 54 70-54 69-54-69Z" fill="#C87B5B"/><path d="m0-71v140l54-69Z" fill="#E0A07A"/><path d="M0-71v140M-54-1H54" stroke="#F3C9A6"/><path d="M0 69c-40 50 45 63 3 119-23 25-40 30-24 63" fill="none" stroke="#AD8B81" stroke-width="2"/></g></g><g fill="none" stroke="#A594AC" stroke-width="1.5"><path d="M190 303v28m-14-14h28M799 470v20m-10-10h20"/></g>`);

for (const [name, source, width] of [["courtyard", courtyard, 1100], ["gulam-chor", gulamChor, 1200], ["playground", playground, 960]]) {
  await writeFile(at("assets/original", `${name}.svg`), source);
  await sharp(Buffer.from(source)).resize(width).webp({ quality: 86, effort: 6 }).toFile(at("public/images", `${name}.webp`));
}

// Prebuild the LCP artwork so a first visit never waits for image conversion.
for (const width of [480, 768, 1100]) {
  const artwork = sharp(at("public/images/courtyard.webp")).resize(width);
  await artwork.clone().avif({ quality: 40, effort: 6 }).toFile(at("public/images", `courtyard-${width}.avif`));
  await artwork.clone().webp({ quality: 72, effort: 6 }).toFile(at("public/images", `courtyard-${width}.webp`));
}

for (const name of ["bap-ka-rasta-gameplay", "bap-ka-rasta-camera"]) {
  await sharp(at("assets/original", name + ".png"))
    .resize(1440, 900, { fit: "cover" })
    .webp({ quality: 86, effort: 6 })
    .toFile(at("public/images", name + ".webp"));
}

const cover = await readFile(at("assets/original/bap-ka-rasta-landing.webp"));
for (const name of ["bap-ka-rasta-seafront", "bap-ka-rasta-conversation", "bap-ka-rasta-mumbai-map"]) {
  await sharp(at("assets/original", name + ".png"))
    .webp({ quality: 86, effort: 6 })
    .toFile(at("public/images", name + ".webp"));
}
await sharp(cover).resize(1536, 1024, { fit: "cover", position: "centre" }).webp({ quality: 88 }).toFile(at("public/images/bap-ka-rasta-cover.webp"));

const socialBase = (title, subtitle, illustration, type = "brand") => svg("0 0 1200 630", `<defs><linearGradient id="socialBg" x2="1" y2="1"><stop stop-color="#FAF9F6"/><stop offset="1" stop-color="#EEE8F0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#socialBg)"/><g transform="translate(66 62) scale(.72)">${emblem()}</g><g transform="translate(155 87) scale(1.25)">${wordmark()}</g><text x="66" y="${type === "brand" ? 299 : 307}" font-family="Georgia,serif" font-size="${type === "brand" ? 90 : 77}" letter-spacing="-4" fill="#26272C">${title}</text><text x="69" y="372" font-family="Arial,sans-serif" font-size="25" fill="#62616A">${subtitle}</text><text x="69" y="552" font-family="Arial,sans-serif" font-size="20" fill="#62616A" letter-spacing="2">VIHAR.ONLINE</text>${illustration}`);
// librsvg reliably decodes embedded PNGs; embedded WebP can silently disappear.
const pngData = async (input) => "data:image/png;base64," + (await sharp(input).png().toBuffer()).toString("base64");
const courtyardData = await pngData(at("public/images/courtyard.webp"));
const gulamData = await pngData(at("public/images/gulam-chor.webp"));
const gameData = await pngData(cover);
await sharp(Buffer.from(socialBase("A space to play.", "Original games. Different worlds.", `<image href="${courtyardData}" x="647" y="45" width="610" height="610"/>`))).png().toFile(at("public/images/social-vihar.png"));
await sharp(Buffer.from(socialBase("Bap Ka Rasta.", "Your auto. Your city. Your little escape.", `<defs><clipPath id="coverClip"><rect x="690" y="52" width="458" height="526" rx="24"/></clipPath></defs><image href="${gameData}" x="580" y="52" width="790" height="526" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/><rect x="715" y="522" width="181" height="31" rx="15" fill="#FAF9F6"/><text x="805" y="543" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#26272C">Concept artwork</text>`, "game"))).png().toFile(at("public/images/social-bap-ka-rasta.png"));
await sharp(Buffer.from(socialBase("Gulam Chor.", "A new world is taking shape. Coming soon.", `<defs><clipPath id="coverClip"><rect x="705" y="52" width="443" height="526" rx="24"/></clipPath></defs><image href="${gulamData}" x="575" y="52" width="700" height="526" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>`, "game"))).png().toFile(at("public/images/social-gulam-chor.png"));
await import("./generate-game-showcase.mjs");
console.log("Generated Vihar logo masters, icons, local fonts, original artwork and sharing images.");
