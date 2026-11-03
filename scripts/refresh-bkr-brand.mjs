import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at=p=>path.join(root,p);
await sharp(at('assets/original/bap-ka-rasta-free-roam.png')).resize(1536,1024).webp({quality:88}).toFile(at('public/images/bap-ka-rasta-cover.webp'));
await sharp(at('assets/original/bap-ka-rasta-mumbai-map.png')).resize(1600,2000).webp({quality:88}).toFile(at('public/images/bap-ka-rasta-mumbai-map.webp'));
// Sharing layout uses the official BR vector, never a regenerated logo.
const art=(await sharp(at('assets/original/bap-ka-rasta-free-roam.png')).resize(710,630,{fit:'cover'}).png().toBuffer()).toString('base64');
const badge=(await sharp(at('public/brand/bap-ka-rasta/br-mark.svg')).resize(88,88).png().toBuffer()).toString('base64');
const social=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#faf8f0"/><image href="data:image/png;base64,${art}" x="490" width="710" height="630"/><rect x="0" width="520" height="630" fill="#faf8f0"/><image href="data:image/png;base64,${badge}" x="48" y="40" width="88" height="88"/><g fill="#24291e" font-family="Arial,sans-serif"><text x="155" y="92" font-size="22" letter-spacing="3">VIHAR PRESENTS</text><text x="45" y="235" font-size="65" font-weight="900">BAP KA</text><text x="45" y="310" font-size="65" font-weight="900">RASTA.</text><text x="48" y="374" font-size="27">Your city. Your ride.</text><text x="48" y="411" font-size="27">Your own way.</text><text x="48" y="493" font-size="19">FREE-ROAMING DRIVING</text><text x="48" y="563" font-size="20">vihar.online</text></g><rect x="965" y="590" width="215" height="25" rx="8" fill="#faf8f0"/><text x="1072" y="608" text-anchor="middle" font-family="Arial" font-size="14" fill="#24291e">Promotional concept artwork</text></svg>`;
await sharp(Buffer.from(social)).png().toFile(at('public/images/social-bap-ka-rasta.png'));
for (const name of ['city-preview','mumbai-chowk','roundabouts']) {
  await sharp(at(`assets/original/bap-ka-rasta-${name}.jpg`)).resize({width:1400,withoutEnlargement:true}).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta-${name}.webp`));
}
for (const name of ['auto','thar','fortuner','toto','scooty','ktm','best_bus','sedan','taxi','hatchback','wagon','crossover','mpv']) {
 await sharp(at(`assets/original/vehicle-renders/${name}.png`)).resize(768,768).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta/${name}-model.webp`));
}
await sharp(at('assets/original/bap-ka-rasta-vehicle-library.webp')).resize(1440).webp({quality:88}).toFile(at('public/images/bap-ka-rasta-vehicle-library.webp'));
await sharp(at('assets/original/bap-ka-rasta-chai-characters.png')).resize(1536,1024).webp({quality:88}).toFile(at('public/images/bap-ka-rasta-chai-characters.webp'));
const crowdIds=['nilesh','farah','suresh','pooja','vikram','zoya','bala','jyoti','shanta','dev','asha','ganesh'];
for (const [index,name] of crowdIds.entries()) {
 await sharp(at('assets/original/bap-ka-rasta-street-crowd.jpg')).extract({left:16+(index%4)*400,top:114+Math.floor(index/4)*530,width:384,height:460}).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta/${name}.webp`));
}
const board=at('assets/original/bap-ka-rasta-city-concepts.png');const boardMeta=await sharp(board).metadata();
for(const [i,name] of ['delhi','kolkata','chennai','bangalore'].entries()){
 const crop={left:(i%2)*Math.floor(boardMeta.width/2),top:Math.floor(i/2)*Math.floor(boardMeta.height/2),width:Math.floor(boardMeta.width/2),height:Math.floor(boardMeta.height/2)};
 await sharp(board).extract(crop).png().toFile(at(`assets/original/bap-ka-rasta-${name}-new.png`));
 await sharp(board).extract(crop).resize(768,512,{fit:'cover'}).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta/${name}-new.webp`));
}
for(const name of ['garage-creative','market-characters']) await sharp(at(`assets/original/bap-ka-rasta-${name}.png`)).resize(1536,1024).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta-${name}.webp`));
for(const name of ['gameplay','camera']) await sharp(at(`assets/original/bap-ka-rasta-${name}.png`)).resize(1440,900).webp({quality:88}).toFile(at(`public/images/bap-ka-rasta-${name}.webp`));
