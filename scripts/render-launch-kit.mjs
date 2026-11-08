// Original repository logos and Barlow/DM Sans typography, rendered without redrawing marks.
// PLAYWRIGHT_MODULE may point to an external @playwright/test installation.
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=p=>path.join(root,p);const out=at('output/launch-kit');await mkdir(out,{recursive:true});
const data=async(p,mime)=>`data:${mime};base64,${(await readFile(at(p))).toString('base64')}`;
const br=await data('public/brand/bap-ka-rasta/br-mark.svg','image/svg+xml');
const vihar=await data('public/brand/vihar-horizontal.svg','image/svg+xml');
const font=await data('public/brand/bap-ka-rasta/barlow-condensed-latin-800-normal.woff2','font/woff2');
const dm=await data('public/fonts/dm-sans-latin.woff2','font/woff2');
const hero=await data('assets/original/bap-ka-rasta-free-roam.png','image/png');
const chai=await data('assets/original/bap-ka-rasta-chai-characters.png','image/png');
const fleet=await data('assets/original/bap-ka-rasta-vehicle-library.webp','image/webp');
const css=`@font-face{font-family:Barlow;src:url('${font}');font-weight:800}@font-face{font-family:DM;src:url('${dm}')}*{box-sizing:border-box}body{margin:0;background:#faf8f0;color:#23281f;font-family:DM,Arial,sans-serif}main{position:relative;overflow:hidden;width:100vw;height:100vh}.top{height:100px;padding:28px 50px;display:flex;align-items:center;justify-content:space-between}.vihar{width:170px;height:46px}.eyebrow{font-size:17px;letter-spacing:2px}.heading{padding:20px 50px 30px;display:flex;gap:28px;align-items:center}.br{width:90px;height:90px}h1{font-family:Barlow;font-size:94px;line-height:.94;font-weight:800;margin:0;letter-spacing:-1px}.sub{font-size:24px;margin:20px 0 0}.art{width:100%;height:740px;object-fit:cover}.foot{padding:28px 50px;display:flex;align-items:center;justify-content:space-between}.tag{font-family:Barlow;font-size:36px}.url{font-size:24px}.note{padding:0 50px;font-size:17px;color:#655f50}.stripe{height:12px;background:#ffcc37}`;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();
async function render(name,body,w,h,extra=''){const html=`<!doctype html><html><head><meta charset="utf-8"><style>${css}${extra}</style></head><body>${body}</body></html>`;await page.setViewportSize({width:w,height:h});await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});await page.screenshot({path:path.join(out,name+'.png')});}
const posters=[
['01-free-roam-launch','YOUR CITY.<br>YOUR RIDE. YOUR WAY.','BAP KA RASTA · FREE-ROAMING DRIVING',hero,'Promotional artwork · More cities and player rides coming soon'],
['02-meet-the-vehicles','13 RIDES.<br>ONE LIVING WORLD.','BAP KA RASTA · THE VEHICLE LIBRARY',fleet,'Actual 3D model render · Player availability varies by vehicle'],
['03-meet-the-mohalla','A LITTLE CHAI.<br>A LOT OF STORIES.','BAP KA RASTA · MEET THE MOHALLA',chai,'Promotional character artwork · Based on the game’s original cast']
];
for(const [name,title,sub,art,note] of posters){await render(name,`<main><div class="top"><img class="vihar" src="${vihar}"><span class="eyebrow">A SPACE TO PLAY.</span></div><div class="heading"><img class="br" src="${br}"><div><h1>${title}</h1><p class="sub">${sub}</p></div></div><div class="stripe"></div><img class="art" src="${art}"><div class="foot"><span class="tag">APNA SHEHER. APNI SAWAARI.</span><span class="url">vihar.online</span></div><p class="note">${note}</p></main>`,1080,1350);await sharp(path.join(out,name+'.png')).resize(864,1080).webp({quality:88}).toFile(at('public/images/bap-ka-rasta-'+name+'.webp'));}
await render('vihar-facebook-cover-1640x624',`<main class="cover"><img class="cover-art" src="${hero}"><div class="cover-shade"></div><div class="cover-copy"><img src="${vihar}"><h1>A space to play.</h1><p>Original games. Familiar worlds.<br>Your own way.</p><b>vihar.online</b></div><span class="feature">FEATURING BAP KA RASTA</span></main>`,1640,624,`.cover{background:#faf8f0}.cover-art{position:absolute;right:0;width:900px;height:624px;object-fit:cover;object-position:65% center}.cover-shade{position:absolute;inset:0;background:linear-gradient(90deg,#faf8f0 0%,#faf8f0 40%,#faf8f0e6 48%,transparent 70%)}.cover-copy{position:absolute;left:330px;top:110px}.cover-copy>img{width:250px;height:70px;object-fit:contain}.cover-copy h1{font-size:86px;margin:22px 0;color:#26272c}.cover-copy p{font-size:27px;line-height:1.5}.cover-copy b{font-size:25px;font-weight:500}.feature{position:absolute;right:300px;bottom:85px;background:#faf8f0e8;padding:10px 16px;font-size:14px;letter-spacing:1px}`);
await sharp(path.join(out,'vihar-facebook-cover-1640x624.png')).resize(820,312).png().toFile(path.join(out,'vihar-facebook-cover-820x312.png'));
await browser.close();
console.log('Rendered three 1080×1350 Vihar posts, website posters and two Facebook cover sizes.');
