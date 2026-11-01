import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Original vector portraits for Vihar ID. No third-party characters, uploads,
// external assets or font dependencies. Stable IDs preserve player choices.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/avatars');
await mkdir(root, { recursive: true });
const portraits = {
  sun: { name: 'Vanguard', accent: '#efb45c', deep: '#55402d', light: '#56606a', drawing: `
    <path d="m26 256 9-53 52-27h82l52 27 9 53" fill="#171c23"/>
    <path d="m34 207 44-25 21 22-14 52H26m196-49-44-25-21 22 14 52h59" fill="url(#armor)"/>
    <path d="m76 195 18 19-7 27-30-18m123-28-18 19 7 27 30-18" fill="#bd8744"/>
    <path d="m97 165-7 31 38 30 38-30-7-31" fill="#0b1016"/>
    <path d="M70 82 90 52l38-12 38 12 20 30 5 54-27 42-36 15-36-15-27-42Z" fill="url(#armor)" stroke="#738087" stroke-width="2"/>
    <path d="m90 52 14 26-8 23-26-19m96-30-14 26 8 23 26-19" fill="#d7a154"/>
    <path d="m119 43 9-3 9 3 7 42-16 9-16-9Z" fill="#b9c1c4"/>
    <path d="m73 88 32-8h46l32 8-8 38-29 13h-36l-29-13Z" fill="#0a1118" stroke="#899295" stroke-width="2"/>
    <path d="m81 94 28-6h39l26 6-6 22-24 10h-33l-24-10Z" fill="url(#accent)"/>
    <path d="m94 95 21-4h29l-31 23H91Z" fill="#fff3d1" opacity=".52"/>
    <path d="m79 133 26 14 7 31-19-9Zm98 0-26 14-7 31 19-9Z" fill="#6b7378"/>
    <path d="m105 140 23 9 23-9-7 38-16 9-16-9Z" fill="#202832"/>
    <path d="M116 158h24m-22 8h20" stroke="#a5afb5" stroke-width="3"/>
    <path d="m114 226 14 10 14-10-4 30h-20" fill="#353e47"/>
    <path d="M49 215v18m158-18v18" stroke="#efb45c" stroke-width="3"/>` },
  moon: { name: 'Phantom', accent: '#b2a0ef', deep: '#403557', light: '#666379', drawing: `
    <path d="m22 256 12-47 49-38h90l49 38 12 47" fill="#14151e"/>
    <path d="m44 213 49-28 35 25 35-25 49 28 12 43H32Z" fill="url(#armor)"/>
    <path d="M53 162 62 95 88 52l40-21 40 21 26 43 9 67-39 39-36-7-36 7Z" fill="#32333f"/>
    <path d="m128 31-14 39-21 25-10 51 9 55-39-39 9-67 26-43Z" fill="url(#armor)"/>
    <path d="m128 31 40 21 26 43 9 67-39 39 9-55-10-51-21-25Z" fill="#232530"/>
    <path d="m128 61 32 34 14 49-15 39-31 15-31-15-15-39 14-49Z" fill="#0c101b"/>
    <path d="m96 111 23 6-5 7-19-5m65-8-23 6 5 7 19-5" fill="#c6b9ff"/>
    <path d="m96 134 32 12 32-12-7 44-25 17-25-17Z" fill="#444354"/>
    <path d="m96 134 16 28 16-16 16 16 16-28m-48 28 16 17 16-17" fill="none" stroke="#737085" stroke-width="2"/>
    <path d="m76 102 12-31 18-17m78 82 8 24-27 26" fill="none" stroke="#8f83b3" stroke-width="3"/>
    <path d="m73 203 34 24-19 29H47m136-53-34 24 19 29h41" fill="#242734"/>
    <path d="m112 212 16 11 16-11-6 44h-20" fill="#080e18"/>
    <path d="M64 227h12m104 0h12" stroke="#b2a0ef" stroke-width="3"/>` },
  tiger: { name: 'Ronin', accent: '#ec826d', deep: '#56332e', light: '#81716b', drawing: `
    <path d="m22 256 6-50 54-30h92l54 30 6 50" fill="#17171b"/>
    <path d="m26 207 58-26 20 31-31 20-43 1m200-26-58-26-20 31 31 20 43 1" fill="#693f3b"/>
    <path d="m29 222 45 1 22-16m131 15-45 1-22-16" fill="none" stroke="#dc7e69" stroke-width="3"/>
    <path d="m96 167-5 31 37 28 37-28-5-31" fill="#090f16"/>
    <path d="m62 99 16-34 50-24 50 24 16 34-12 53-30 38h-48l-30-38Z" fill="url(#armor)" stroke="#ad9790" stroke-width="2"/>
    <path d="m62 99-10-41 38 31 38-14 38 14 38-31-10 41-26 25H88Z" fill="#813f39"/>
    <path d="m56 61 32 28 40-14 40 14 32-28-12 29-25 9-35-15-35 15-25-9Z" fill="#e59a83"/>
    <path d="m81 106 47-12 47 12-9 22h-76Z" fill="#090f16"/>
    <path d="m88 110 29 1-5 7H91m77-8-29 1 5 7h21" fill="#ffb7a0"/>
    <path d="m80 134 29 2 19-9 19 9 29-2-14 29-34 23-34-23Z" fill="#37363c"/>
    <path d="m86 139 21 11-8 13m71-24-21 11 8 13" fill="none" stroke="#a2918d" stroke-width="3"/>
    <path d="m120 141 8-9 8 9 7 27-15 10-15-10Z" fill="#a36556"/>
    <path d="M121 157h14m-12 7h10" stroke="#151923" stroke-width="3"/>
    <path d="m128 40 8 15-8 19-8-19Z" fill="#f0a087"/>
    <path d="m98 218 30 14 30-14-9 38h-42" fill="#34323b"/>` },
  frog: { name: 'Vector', accent: '#83ccbb', deep: '#254946', light: '#567a78', drawing: `
    <path d="m24 256 8-50 53-29h86l53 29 8 50" fill="#131e26"/>
    <path d="m37 208 41-21 31 28-12 41H24m195-48-41-21-31 28 12 41h73" fill="url(#armor)"/>
    <path d="M104 155h48v53l-24 18-24-18Z" fill="#2c434b"/>
    <path d="M108 183h40m-40 9h40m-40 9h40" stroke="#6b8b8b" stroke-width="3"/>
    <path d="M58 96h20v53H58Zm120 0h20v53h-20Z" fill="#6c8787"/>
    <path d="M62 108h12v27H62m120-27h12v27h-12" fill="#0b1a23"/>
    <path d="m78 58 50-18 50 18 5 78-24 42-31 12-31-12-24-42Z" fill="url(#armor)" stroke="#89a7a1" stroke-width="2"/>
    <path d="m88 67 32-12h16l32 12-2 29H90Z" fill="#879f9c"/>
    <path d="M121 55h14v41h-14Z" fill="#354e56"/>
    <path d="m81 102 47 5 47-5-4 27-43 7-43-7Z" fill="#071922"/>
    <path d="M90 115h24m28 0h24" stroke="#aafbe0" stroke-width="5"/>
    <path d="m87 139 25 5 16-8 16 8 25-5-18 30-23 9-23-9Z" fill="#22333f"/>
    <path d="M112 157h32m-28 8h24" stroke="#809d9d" stroke-width="3"/>
    <path d="m52 210 25-12 17 16-11 15-26-7m147-12-25-12-17 16 11 15 26-7" fill="#243c44"/>
    <path d="M58 214h19m102 0h19M122 234h12" stroke="#93dac4" stroke-width="3"/>` },
  kite: { name: 'Nomad', accent: '#dfba8e', deep: '#494236', light: '#70776e', drawing: `
    <path d="m23 256 9-51 52-27h88l52 27 9 51" fill="#16252c"/>
    <path d="m34 207 38-20 37 26-21 43H23m199-49-38-20-37 26 21 43h65" fill="url(#armor)"/>
    <path d="M105 146h46v44h-46Z" fill="#aa795a"/>
    <path d="M87 75h82v53l-15 33-26 18-25-18-16-33Z" fill="url(#skin)"/>
    <path d="m128 85 21-11 19 18v36l-15 33-25 18 8-32-8-9Z" fill="#b98765"/>
    <path d="m81 113-6-38 18-28 49-12 31 22 6 40-14 9-5-31-42 4-23 21-3 23Z" fill="#20262b"/>
    <path d="m90 72 14-17 37-11 18 12-39 5-21 17" fill="#535c5b"/>
    <path d="m79 94 47-4 49 4-7 30-37 3-11-8-9 7-27-6Z" fill="#152c34" stroke="#b5b5a2" stroke-width="3"/>
    <path d="m89 99 28-3-7 19-19-2m42-17 31 3-3 17-26 3Z" fill="#78b3b2"/>
    <path d="m94 101 11-1-10 10m46-10 14 1-15 12" stroke="#c2e8db" stroke-width="3" opacity=".7"/>
    <path d="m129 125-5 13 9 2m-14 12h20" fill="none" stroke="#795840" stroke-width="3"/>
    <path d="m85 162 42 20 44-20 16 29-38 31-27-3-46-27Z" fill="#b1a087"/>
    <path d="m85 176 42 17 45-15m-79 13 37 17 28-14" fill="none" stroke="#6e7065" stroke-width="3"/>
    <path d="m151 216 26-22 2 62h-40Z" fill="#827c69"/>
    <path d="M53 216v28m147-28v28" stroke="#b5c0ad" stroke-width="3"/>` },
  planet: { name: 'Orbit', accent: '#9ebfe9', deep: '#303c5a', light: '#858f9e', drawing: `
    <path d="m25 256 7-46 52-31h88l52 31 7 46" fill="#384454"/>
    <path d="m34 213 48-26 32 27-12 42H25m197-43-48-26-32 27 12 42h77" fill="#aab5bd"/>
    <path d="m62 211 19-11 11 16-7 40H65m129-45-19-11-11 16 7 40h20" fill="#26394d"/>
    <path d="M98 159h60v34l-30 21-30-21Z" fill="#101e30"/>
    <path d="M62 104c0-38 26-67 66-67s66 29 66 67v35l-27 41-39 17-39-17-27-41Z" fill="#bac6ce"/>
    <path d="M128 37c40 0 66 29 66 67v35l-27 41-39 17v-16l33-15 19-31v-31c0-34-18-56-52-59Z" fill="#7a8d9d"/>
    <path d="M76 103c0-28 20-48 52-48s52 20 52 48v23l-23 25H99l-23-25Z" fill="url(#glass)" stroke="#425b71" stroke-width="3"/>
    <path d="M88 98c0-19 13-32 36-33l20 4-41 43-15-3Z" fill="#829fc6" opacity=".55"/>
    <path d="m121 146 42-45 8 12-23 27Z" fill="#819ab7" opacity=".3"/>
    <path d="M58 103h19v39H58m121-39h19v39h-19" fill="#60798f"/>
    <path d="M61 112h8v20h-8m126-20h8v20h-8" fill="#b6d7ee"/>
    <path d="m88 148 17 11h46l17-11-8 26-32 13-32-13Z" fill="#d0d9dd"/>
    <path d="M112 168h32" stroke="#4f667a" stroke-width="4"/>
    <path d="m110 219 18 8 18-8-5 37h-26Z" fill="#304b66"/>
    <path d="M76 227v17m104-17v17" stroke="#a5c9ef" stroke-width="4"/>
    <circle cx="188" cy="216" r="5" fill="#485f76"/>` },
};
for (const [id, { name, accent, deep, light, drawing }] of Object.entries(portraits)) {
  await writeFile(path.join(root, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${name} avatar">
    <defs>
      <clipPath id="circle"><circle cx="128" cy="128" r="128"/></clipPath>
      <radialGradient id="background" cx=".3" cy=".2" r=".95"><stop stop-color="${deep}"/><stop offset="1" stop-color="#101923"/></radialGradient>
      <linearGradient id="armor" x2=".8" y2="1"><stop stop-color="${light}"/><stop offset=".55" stop-color="#343e4a"/><stop offset="1" stop-color="#202631"/></linearGradient>
      <linearGradient id="accent" x2=".9" y2="1"><stop stop-color="#fff0bd"/><stop offset=".4" stop-color="${accent}"/><stop offset="1" stop-color="#9b602e"/></linearGradient>
      <linearGradient id="skin" x2="1" y2="1"><stop stop-color="#e2b28a"/><stop offset="1" stop-color="#c18c67"/></linearGradient>
      <linearGradient id="glass" x2=".9" y2="1"><stop stop-color="#304d71"/><stop offset=".55" stop-color="#112a44"/><stop offset="1" stop-color="#081722"/></linearGradient>
    </defs>
    <g clip-path="url(#circle)">
      <path fill="url(#background)" d="M0 0h256v256H0Z"/>
      <circle cx="128" cy="117" r="95" fill="none" stroke="${accent}" stroke-opacity=".14"/>
      <path d="m-20 182 139-210M96 280 276 16" stroke="${accent}" stroke-opacity=".07" stroke-width="24"/>
      <path d="M35 68V51h17m152 0h17v17M26 134h13m178 0h13" fill="none" stroke="${accent}" stroke-opacity=".5" stroke-width="2"/>
      ${drawing.trim()}
      <circle cx="128" cy="128" r="125" fill="none" stroke="${accent}" stroke-opacity=".23"/>
    </g>
  </svg>\n`);
}
console.log('Generated six original Vihar gamer portraits.');
