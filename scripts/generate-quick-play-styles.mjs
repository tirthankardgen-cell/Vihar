import assert from "node:assert/strict";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { newQuickPlayArt } from "./quick-play-new-art.mjs";

// Flat editorial illustrations based on section 7 of every Vihar Games GAME_SPEC.
// Preserve the earlier PNG studies and actual gameplay screenshots. No engine,
// interface or live game state is represented by these promotional illustrations.
const C = { ink: "#293D35", teal: "#2B4A42", rust: "#AF6443", ochre: "#C99558", cream: "#F5E6C5", brass: "#DFB36D", sky: "#7A929A" };
const rect = (x,y,w,h,fill,rx=0,extra="") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const circle = (x,y,r,fill,extra="") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const path = (d,fill,stroke="none",w=2,extra="") => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const line = (x,y,xx,yy,color,w=2,extra="") => path(`M${x} ${y}L${xx} ${yy}`,"none",color,w,extra);
const text = (x,y,value,size,fill,extra="") => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" fill="${fill}" ${extra}>${value}</text>`;
const group = (x,y,s,body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
const many = (n,fn) => Array.from({length:n},(_,i)=>fn(i)).join("");
const svg = (body,width=1200,height=630) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs><pattern id="grain" width="43" height="37" patternUnits="userSpaceOnUse"><path d="M4 7h2m17 19h3m11-24h1M7 31h1" stroke="#293D35" stroke-width=".7" opacity=".12"/></pattern></defs>${body}${rect(0,0,width,height,"url(#grain)")}</svg>`;
const paper = fill => rect(0,0,1200,630,fill);
const leaf = (x,y,s,angle,color) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">${path("M0 0Q-27-35 0-63Q27-35 0 0Z",color)}${path("M0-5V-51M0-22l-10-12M0-35l10-10","none",C.cream,1.2,'opacity=".3"')}</g>`;
const motif = (x,y,color) => group(x,y,1,path("M0-12 8 0 0 12-8 0Z","none",color,1.5)+circle(0,0,2,color));
// Shared paint colours and linework, with three independently composed scenes.
// Scenery is never a shared template with only the playing board replaced.
const chai = (x,y,s=1) => group(x,y,s,rect(0,0,27,33,C.cream,3,`stroke="${C.ink}" stroke-width="2"`)+path("M27 6h11v16H27","none",C.ink)+path("M10-9q-7-8 0-16m10 16q-7-8 0-16","none",C.cream));
const chessCourtyard = () => paper("#9D573C")
  +rect(0,0,1200,437,"#B97550")+path("M770 0H1200V350L971 392Z","#CE9266")
  +rect(0,437,1200,193,"#B58755")+line(0,450,1200,450,C.rust,3)
  +path("M55 630Q90 442 69 256Q61 128 122 0M75 265 235 150M91 140 24 88","none",C.ink,17)
  +many(21,i=>leaf((i%5)*55-10,Math.floor(i/5)*60+44,.9,i%2?-68:60,i%3?C.ink:C.teal))
  +path("M967 348V173a90 90 0 0 1 180 0v175Z",C.brass)+path("M978 342V175a79 79 0 0 1 158 0v167Z",C.teal)
  +line(1057,96,1057,342,C.sky,3)+many(6,i=>line(989,193+i*26,1125,193+i*26,C.sky,3))
  +rect(155,367,134,58,C.cream,0,`stroke="${C.ink}" stroke-width="2"`)+many(6,i=>line(158+i*23,372,180+i*23,420,C.rust,2))+line(163,425,163,466,C.ink,4)+line(281,425,281,466,C.ink,4)
  +chai(221,332,.8)+rect(961,495,190,81,"#DEC79F",0,`stroke="${C.ink}" stroke-width="2"`)+many(5,i=>motif(983+i*35,515,C.rust))
  +path("M998 456h70l-9 35h-52Z",C.rust,C.ink)+leaf(1033,454,.7,-39,C.ink)+leaf(1033,454,.7,41,C.teal);
const carromVeranda = () => paper("#D6AE71")
  +rect(0,0,1200,354,"#E2BC83")+rect(0,0,1200,47,C.ochre)+path("M905 0H1200V354H1130Z","#EBD2A6")
  +rect(0,354,1200,276,"#C18B59")+many(4,i=>line(0,384+i*65,1200,384+i*65,"#AD754C",1.2))
  +rect(64,112,209,182,C.ochre)+rect(76,124,185,158,C.teal)+line(168,124,168,282,C.sky,4)+many(5,i=>line(85,143+i*28,252,143+i*28,C.sky,3))
  +path("M1130 0Q1090 126 1182 227M1118 73 995 43M1120 137 1001 104","none",C.ink,10)+many(13,i=>leaf(990+i%4*58,25+Math.floor(i/4)*57,.75,i%2?63:-63,i%3?C.teal:C.ink))
  +rect(40,398,244,190,C.cream)+rect(53,411,218,164,"none",0,`stroke="${C.rust}" stroke-width="3"`)+many(20,i=>motif(76+i%5*44,436+Math.floor(i/5)*40,C.rust))
  +rect(976,400,165,37,C.cream,0,`stroke="${C.ink}" stroke-width="3"`)+many(6,i=>line(981+i*27,404,1004+i*27,433,C.rust,2))+line(984,437,984,476,C.ink,4)+line(1133,437,1133,476,C.ink,4)
  +chai(1035,362)+path("M988 535h64l-8 43h-48Z",C.rust,C.ink)+leaf(1018,534,.7,35,C.teal)+leaf(1018,534,.7,-38,C.ink);
const ludoGathering = () => paper("#E9D1A6")
  +rect(0,0,1200,390,"#EEDDBC")+rect(0,390,1200,240,C.rust)+line(0,402,1200,402,"#C78457",4)
  +rect(85,143,182,266,C.ochre)+rect(98,155,156,253,C.teal)+line(176,155,176,408,C.sky,3)+many(8,i=>line(108,180+i*27,244,180+i*27,C.sky,2.5))
  +rect(39,485,246,79,C.cream,0,`stroke="${C.ink}" stroke-width="3"`)+many(10,i=>line(46+i*23,489,66+i*23,559,C.ochre,3))+line(51,564,51,610,C.ink,4)+line(272,564,272,610,C.ink,4)
  +path("M1169 0Q1111 166 1156 286M1144 59 1013 43M1136 160 1002 117","none",C.ink,11)+many(18,i=>leaf(965+i%5*55,22+Math.floor(i/5)*67,.8,i%2?-64:57,i%3?C.teal:C.ink))
  +rect(959,290,157,103,C.ochre)+rect(969,300,137,83,C.teal)+line(1038,300,1038,383,C.sky,3)+many(3,i=>line(980,316+i*23,1095,316+i*23,C.sky,2))
  +chai(244,451,.85)+chai(958,524,.85)+rect(918,538,184,43,"#DFBD83",0,`stroke="${C.ink}" stroke-width="2"`)
  +path("M1067 471h81l-12 59h-56Z",C.ochre,C.ink)+many(5,i=>leaf(1105,470,.5,-64+i*30,C.teal))
  +many(5,i=>circle(1085+i*11,438+(i%2)*12,5,i%2?C.cream:C.brass))
  +many(5,i=>motif(61+i*52,59,C.rust));
const grid = (n,cell,x,y,light,dark) => many(n*n,i=>rect(x+i%n*cell,y+Math.floor(i/n)*cell,cell,cell,(i%n+Math.floor(i/n))%2?dark:light));
const art = new Map();

// Six recognizable silhouettes, two contrasting treatments. Black retains a
// narrow cream boundary on deep-teal cells, with upright canonical coordinates.
const pieces = {
  pawn: circle(0,-15,7,"currentColor")+path("M-5-6h10l4 21h-18ZM-12 16h24v6h-24Z","currentColor"),
  rook: path("M-13-23h7v7h4v-7h5v7h4v-7h7v16H9L8 13h6v9h-28v-9h6L-9-7h-4Z","currentColor"),
  bishop: path("M0-28Q19-12 8 1L6 14h7v8h-26v-8h7L-8 1Q-19-12 0-28Z","currentColor")+path("M-2-21 4-12","none","var(--detail)",2.5),
  knight: path("M-14 22v-8h4Q-8 0 2-7L-7-5-16-11 1-25l1-6 10 6Q23-11 12 14h3v8Z","currentColor")+circle(5,-17,1.8,"var(--detail)"),
  queen: path("M-13-15-7 10H7l6-25L5-8 0-20-5-8ZM-8 12H8l6 10h-28Z","currentColor")+many(3,i=>circle(-13+i*13,i===1?-24:-18,3,"currentColor")),
  king: path("M0-30v14m-6-8H6","none","currentColor",4)+path("M-11-12Q0-18 11-12L7 10H-7ZM-8 13H8l6 9h-28Z","currentColor"),
};
const piece = (kind,x,y,white) => {
  const fill=white?C.cream:C.ink, detail=white?C.ink:C.cream;
  const body=pieces[kind].replaceAll("currentColor",fill).replaceAll("var(--detail)",detail).replaceAll('stroke="none"',`stroke="${detail}"`);
  return `<g transform="translate(${x} ${y})" stroke="${detail}" stroke-width="1.5" stroke-linejoin="round">${body}</g>`;
};
let chess=chessCourtyard()+rect(330,45,540,540,C.ochre)+rect(341,56,518,518,C.ink)+grid(8,62,352,67,C.cream,C.teal);
const order=["rook","knight","bishop","queen","king","bishop","knight","rook"];
chess+=many(8,i=>piece(order[i],383+62*i,98,false)+piece("pawn",383+62*i,160,false)+piece("pawn",383+62*i,470,true)+piece(order[i],383+62*i,532,true));
chess+=many(8,i=>text(383+i*62,566,"abcdefgh"[i],12,C.cream)+text(343,98+i*62,8-i,12,C.cream));
art.set("chess",svg(chess));

let carrom=carromVeranda()+rect(330,45,540,540,C.ochre,0,`stroke="${C.ink}" stroke-width="3"`)+rect(352,67,496,496,C.cream,0,`stroke="${C.ink}" stroke-width="2"`);
carrom+=many(4,i=>`<g transform="rotate(${i*90} 600 315)">${line(449,489,751,489,C.rust)}${line(449,505,751,505,C.rust)}${circle(449,497,8,C.rust)}${circle(751,497,8,C.rust)}${path("M410 504 454 460m-44 44 16-4m-16 4 4-16","none",C.ink)}</g>`);
carrom+=[[377,92],[823,92],[377,538],[823,538]].map(([x,y])=>circle(x,y,19,C.ink)).join("")+circle(600,315,73,"none",`stroke="${C.rust}" stroke-width="2"`);
const coin=(x,y,dark)=>circle(x,y,12,dark?C.ink:C.cream,`stroke="${dark?C.cream:C.ink}" stroke-width="1.5"`)+circle(x,y,8,"none",`stroke="${dark?C.cream:C.ink}" stroke-width=".8"`);
carrom+=many(6,i=>coin(600+Math.cos(i*Math.PI/3)*25,315+Math.sin(i*Math.PI/3)*25,i%2))+many(12,i=>coin(600+Math.cos(i*Math.PI/6)*50,315+Math.sin(i*Math.PI/6)*50,i%2));
carrom+=circle(600,315,12,C.rust,`stroke="${C.ink}" stroke-width="1.5"`)+motif(600,315,C.cream)+circle(541,497,20,C.brass,`stroke="${C.ink}" stroke-width="2"`)+circle(541,497,14,"none",`stroke="${C.ink}" stroke-width="1.5"`)+motif(541,497,C.ink);
art.set("carrom",svg(carrom));

// Verify the exact 52-cell loop, starts 0/13/26/39, six private home cells
// and section 2 safe indices. Finish cells occupy the center triangles.
const track=[[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[0,6]];
assert.equal(new Set(track.map(p=>p.join(","))).size,52);
const safe=new Set([0,8,13,21,26,34,39,47]), seats=[C.rust,C.teal,"#596880",C.ochre];
const symbol=(x,y,i,color)=>i===0?path(`M${x} ${y-4}l4 4-4 4-4-4Z`,color):i===1?circle(x,y,4,"none",`stroke="${color}" stroke-width="2"`):i===2?path(`M${x-4} ${y+4}l4-8 4 8Z`,color):path(`M${x-4} ${y}h8m-4-4v8`,"none",color);
const token=(x,y,i,r=12)=>circle(x,y,r,seats[i],`stroke="${C.ink}" stroke-width="1.5"`)+symbol(x,y,i,C.cream);
let ludo=ludoGathering()+rect(342,57,516,516,C.cream,0,`stroke="${C.ink}" stroke-width="2"`);
[[0,0],[9,0],[9,9],[0,9]].forEach(([x,y],i)=>{ludo+=rect(360+x*32,75+y*32,192,192,seats[i])+rect(382+x*32,97+y*32,148,148,C.cream);[[2,2],[4,2],[2,4],[4,4]].forEach(([xx,yy])=>{ludo+=token(360+(x+xx)*32,75+(y+yy)*32,i,16);});});
track.forEach(([x,y],i)=>{ludo+=rect(360+x*32,75+y*32,32,32,i%13===0?seats[i/13]:C.cream,0,`stroke="${C.ink}" stroke-width=".8"`);if(safe.has(i))ludo+=path(`M${376+x*32} ${82+y*32}l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z`,"none",i%13===0?C.cream:C.ink,1.2);});
for(let i=0;i<6;i++)[[i+1,7],[7,i+1],[13-i,7],[7,13-i]].forEach(([x,y],seat)=>{ludo+=rect(360+x*32,75+y*32,32,32,seats[seat],0,`stroke="${C.cream}" stroke-width="1"`);});
ludo+=many(4,i=>`<g transform="rotate(${i*90} 600 315)">${path("M552 267 600 315 552 363Z",seats[i],C.cream,1)}</g>`);
art.set("ludo",svg(ludo));

let pool=paper("#172D26")+rect(183,94,834,442,"#352F27",28)+rect(209,120,782,390,"#245846",18,`stroke="${C.ochre}" stroke-width="2"`)+rect(232,142,736,346,"none",10,'stroke="#759184" stroke-width="1.5"');
pool+=[[229,142],[600,128],[971,142],[229,488],[600,502],[971,488]].map(([x,y])=>circle(x,y,19,"#111E19",'stroke="#A58657" stroke-width="1.5"')).join("");
pool+=line(272,400,433,322,C.ochre,8)+line(427,326,443,319,C.cream,5)+line(467,308,645,231,C.cream,1.5,'stroke-dasharray="6 7"')+circle(460,309,16,"#FFF8E8",'stroke="#172D26" stroke-width="1.5"');
[[692,237,"#D8AC40",1,false],[738,277,"#3E6CA0",2,false],[635,354,"#C4624F",3,false],[799,355,"#161D1A",8,false],[677,407,"#D8AC40",9,true],[842,236,"#C4624F",11,true]].forEach(([x,y,c,n,stripe])=>{pool+=circle(x,y,19,stripe?"#FFF8E8":c,'stroke="#172D26" stroke-width="1.5"')+(stripe?rect(x-17,y-9,34,18,c,7):"")+circle(x,y,10,"#FFF8E8")+text(x,y,n,12,C.ink,'font-weight="bold"');});
pool+=line(385,558,815,558,C.brass,1)+motif(353,558,C.brass)+motif(847,558,C.brass);
art.set("billiards",svg(pool));

let checkers=paper("#EFE7D7")+rect(323,38,554,554,"#293958")+grid(8,60,360,75,"#F5EBD5","#3F5174");
checkers+=many(13,i=>motif(345+i*42,53,C.cream)+motif(345+i*42,577,C.cream)+motif(338,64+i*42,C.cream)+motif(862,64+i*42,C.cream));
[[1,0],[3,0],[5,0],[7,0],[0,1],[2,1],[6,1],[3,2],[5,2],[4,3]].forEach(([x,y])=>{checkers+=circle(390+x*60,105+y*60,21,C.rust,`stroke="${C.cream}" stroke-width="1.5"`)+circle(390+x*60,105+y*60,14,"none",`stroke="${C.cream}" stroke-width="1.5"`);});
[[0,7],[2,7],[4,7],[6,7],[1,6],[5,6],[7,6],[2,5],[6,5],[3,4]].forEach(([x,y],i)=>{const xx=390+x*60,yy=105+y*60;checkers+=circle(xx,yy,21,"#F5EBD5",'stroke="#293958" stroke-width="1.5"')+(i===9?path(`M${xx-11} ${yy-6}l5 4 6-8 6 8 5-4-3 15h-16Z`,"#293958"):circle(xx,yy,4,"#293958"));});
checkers+=group(146,290,1,path("M0-44Q-31-20 0 0Q31-20 0-44ZM0 0Q-31 24 0 46Q31 24 0 0Z","none","#3F5174",3))+group(1048,345,1,path("M0-44Q-31-20 0 0Q31-20 0-44ZM0 0Q-31 24 0 46Q31 24 0 0Z","none","#3F5174",3));
art.set("checkers",svg(checkers));

const coral="#C96555",mustard="#D4AD4C",blue="#4C78A0";
let connect=paper("#FAF0DA")+rect(318,64,564,502,blue,24)+rect(333,79,534,472,"none",15,'stroke="#C9DBE2" stroke-width="1.5"');
const columns=[[],[0],[1,0],[0,1,0],[1,0],[0,1,1],[1]];
connect+=many(42,i=>{const c=i%7,r=Math.floor(i/7),x=369+c*77,y=116+r*79,owner=columns[c][5-r];return circle(x,y,29,owner===undefined?"#F3E8D1":owner?mustard:coral,'stroke="#284E70" stroke-width="1.5"')+(owner===undefined?"":owner?circle(x,y,11,"none",'stroke="#674F20" stroke-width="2"'):path(`M${x-5} ${y-5}l10 10m0-10-10 10`,"none","#6C352C"));});
connect+=motif(174,315,blue)+motif(1026,315,coral);
art.set("connect-four",svg(connect));

// At least fifteen distinct everyday identities, all reusable as small flat SVGs.
const keepsakes={
  mango:path("M-9-25C34-30 36 27 7 34C-33 44-45 5-9-25Z",mustard,C.ink,2.5)+path("M-9-25q0-19 19-20M-5-27q22-16 39-1Q14-12-5-27Z","none","#63876B",3),
  kite:path("M0-38 30-3 0 29-30-3Z",coral,C.ink,2.5)+path("M0-38V29m-30-32h60M0 29q-16 18 0 27q18 6 2 18","none",C.ink,2.5)+path("M0-38 30-3H0Z",mustard),
  chai:rect(-28,-21,51,44,"#F4E4C1",5,`stroke="${C.ink}" stroke-width="2.5"`)+path("M23-12h16q16 24-16 26M-35 28h70M-13-33q-12-12 0-21m18 21q-12-12 0-21","none",C.ink,2.5)+rect(-24,-17,43,9,"#A56845",2),
  bird:path("M-29 10Q-39-21-5-19Q8-45 26-22L42-11 26-5Q27 30-8 27Z",blue,C.ink,2.5)+path("M-12 0q30 1 13 20M-8 28v12m19-13v13M-28 13-43 24-34-2","none",C.ink,2.5)+circle(18,-17,2.5,C.cream),
  flower:many(6,i=>`<g transform="rotate(${i*60})">${circle(0,-24,15,coral,`stroke="${C.ink}" stroke-width="2"`)}</g>`)+circle(0,0,14,mustard,`stroke="${C.ink}" stroke-width="2.5"`)+path("M0 38v21m0-9q22-26 29-12Q19 55 0 50","none","#63876B",3),
  umbrella:path("M-40 2Q-29-51 0-39Q29-51 40 2q-15-11-26 0q-14-11-28 0q-11-11-26 0Z",blue,C.ink,2.5)+path("M0-43v78q0 20-13 14q-8-4-8-10M-14 2Q-14-30 0-39Q14-30 14 2","none",C.ink,2.5),
  book:path("M-34-29Q-12-35 0-25Q12-35 34-29V30Q12 24 0 34Q-12 24-34 30Z","#F4E4C1",C.ink,2.5)+path("M0-25v59M-26-16l18 1m-18 12 18 1m16-1 18-1m-18-12 18-1","none",blue,2.5),
  bicycle:circle(-27,15,20,"none",`stroke="${C.ink}" stroke-width="2.5"`)+circle(29,15,20,"none",`stroke="${C.ink}" stroke-width="2.5"`)+path("M-27 15-12-16 9 15h-36l30-27 26 27-10-44h-13m-24 10h18","none",coral,4),
  lamp:path("M-28 30Q-41 1 0 8Q41 1 28 30Q0 48-28 30Z",coral,C.ink,2.5)+path("M0 8Q-22-5 0-38Q22-5 0 8Z",mustard,C.ink,2.5)+path("M0 8v15","none",C.ink,2.5),
  fish:path("M-34 0Q0-36 31 0Q0 36-34 0L-46-19v38Z",blue,C.ink,2.5)+path("M-5-12q14 12 0 24M-18-16 0-30 12-18","none",C.ink,2.5)+circle(19,-4,3,C.cream),
  leaf:path("M-27 33Q-52-33 34-39Q44 33-27 33Z","#63876B",C.ink,2.5)+path("M-38 46 26-30M-12 18l-12-23M3 2l23 2M8-4-2-23","none",C.cream,2.5),
  radio:rect(-40,-25,80,58,coral,6,`stroke="${C.ink}" stroke-width="2.5"`)+rect(-31,-15,42,36,"#F4E4C1",2)+many(5,i=>line(-26,-10+i*6,5,-10+i*6,C.ink))+circle(26,-8,6,mustard)+circle(26,16,6,mustard)+path("M-25-27 19-49","none",C.ink,2.5),
  shoe:path("M-37 10-29-27-7-20 2 2 31 14q19 9 8 19h-77Z",mustard,C.ink,2.5)+path("M-37 26h77M-10-10l15-3m-10 11 15-3","none",C.ink,2.5),
  clock:circle(0,0,35,"#F4E4C1",`stroke="${C.ink}" stroke-width="2.5"`)+circle(0,0,29,"none",`stroke="${blue}" stroke-width="2"`)+path("M0-21V0l17 10M-24-35l-10-6m58 6 10-6M-21 28l-6 13m48-13 6 13","none",C.ink,3)+circle(0,0,3,coral),
  pot:path("M-34-4h68l-8 42h-52Z",coral,C.ink,2.5)+path("M0-4v-26M0-11Q-33-51-31-24Q-27-9 0-11M0-20Q31-55 29-29Q24-12 0-20","none","#63876B",4),
};
assert.equal(Object.keys(keepsakes).length,15);
const back=rect(-52,-67,104,134,"#F5EAD5",8,`stroke="${C.ink}" stroke-width="2"`)+many(12,i=>motif(-31+i%3*31,-43+Math.floor(i/3)*29,"#82907A"));
const faces=["mango",null,"kite",null,"chai","mango",null,"bird","chai",null,"flower","umbrella"];
const memory=paper("#FAF1E2")+faces.map((name,i)=>group(380+i%4*146,150+Math.floor(i/4)*164,1,name?rect(-52,-67,104,134,"#FFFAEF",8,`stroke="${C.ink}" stroke-width="2"`)+group(0,0,.75,keepsakes[name])+(i===0||i===5?path("M29-48l5 5 9-10","none","#63876B",3):""):back)).join("");
art.set("memory-match",svg(memory));

let reversi=paper("#F4F0E2")+rect(346,61,508,508,"#48634E",2)+rect(360,75,480,480,"#91A68C");
reversi+=many(9,i=>line(360+i*60,75,360+i*60,555,"#57715C",1.5)+line(360,75+i*60,840,75+i*60,"#57715C",1.5));
[[3,3,false],[4,4,false],[4,3,true],[3,4,true]].forEach(([x,y,dark])=>{reversi+=circle(390+x*60,105+y*60,23,dark?"#292F2B":"#FFF9EB",'stroke="#48634E" stroke-width="1.5"');});
[[2,3],[3,2],[4,5],[5,4]].forEach(([x,y])=>{reversi+=circle(390+x*60,105+y*60,5,"#48634E");});
reversi+=path("M152 478q46-128 24-215","none","#63876B",3)+leaf(168,415,.65,-60,"#8DA084")+leaf(178,372,.65,55,"#63876B")+leaf(182,325,.65,-47,"#8DA084")+leaf(1052,166,.7,115,"#8DA084");
art.set("reversi",svg(reversi));

// Derive numeral clues from an actual ten-mine Beginner layout.
const mines=new Set([6,14,18,25,40,47,61,71,73,80]);
assert.equal(mines.size,10);
const clues=["","#315CA0","#387049","#AD5142","#595397","#874D39","#337E86","#30383C","#62686A"];
let sweeper=paper("#262C30")+rect(342,47,516,536,"#373F44",4)+rect(362,65,476,39,"#1F272B",2)+text(404,85,"008",20,"#8EC7BF")+text(794,85,"000",20,"#F0ECE0");
sweeper+=many(81,i=>{const x=371+i%9*51,y=118+Math.floor(i/9)*51,closed=i%9>=5||Math.floor(i/9)>=5||mines.has(i);let cell=rect(x,y,49,49,closed?"#BBC2C5":"#E9EDE9",0,'stroke="#707C82" stroke-width="1"');if([6,40].includes(i))return cell+path(`M${x+19} ${y+37}V${y+11}h22l-8 8 8 8h-22Z`,"#347E77","#245751",1.5)+line(x+12,y+38,x+30,y+38,"#245751");if(closed)return cell;let count=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=i%9+dx,yy=Math.floor(i/9)+dy;if(xx>=0&&xx<9&&yy>=0&&yy<9&&mines.has(yy*9+xx))count++;}return cell+(count?text(x+24.5,y+25,count,26,clues[count],'font-weight="bold"'):"");});
sweeper+=many(3,i=>rect(193+i*12,296+i%2*12,8,8,"#75AAA3")+rect(986+i*12,296+i%2*12,8,8,"#75AAA3"));
art.set("minesweeper",svg(sweeper));

const notebook=paper("#FBF7EC")+many(17,i=>line(0,22+i*38,1200,22+i*38,"#B7C9CF",1.4))+line(198,0,198,630,"#D6AAA0",1.5);
let tic=notebook+`<g transform="rotate(-2 600 315)">${path("M524 124Q518 310 525 511M681 127Q688 314 679 509M382 254Q603 249 816 257M382 383Q600 392 819 382","none","#42494A",5)}`;
tic+=[[444,187],[602,320],[760,449]].map(([x,y],i)=>path(`M${x-29} ${y-30}Q${x} ${y+4} ${x+30} ${y+28}M${x+31} ${y-28}Q${x-3} ${y-2} ${x-27} ${y+31}`,"none","#496E9A",7+i%2)).join("");
tic+=[[757,189],[445,449]].map(([x,y])=>path(`M${x+15} ${y-30}C${x-40} ${y-51} ${x-47} ${y+36} ${x+2} ${y+35}C${x+53} ${y+36} ${x+43} ${y-43} ${x+7} ${y-33}`,"none","#AD5F58",7)).join("")+path("M403 146Q607 311 799 489","none","#496E9A",3)+"</g>";
art.set("tic-tac-toe",svg(tic));

let sudoku=paper("#FBF7ED")+rect(334,49,532,532,"#FFFDF4",0,'stroke="#D8D5C8" stroke-width="1"')+rect(572,76,53,477,"#EBF0EF")+rect(360,288,477,53,"#EBF0EF")+rect(572,288,53,53,"#D9E6EA",0,'stroke="#496E9A" stroke-width="2"');
sudoku+=many(10,i=>line(360+i*53,76,360+i*53,553,"#414848",i%3?1:3)+line(360,76+i*53,837,76+i*53,"#414848",i%3?1:3));
const givens=["53..7....","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79"];
sudoku+=givens.flatMap((row,y)=>[...row].map((n,x)=>n==='.'?'':text(386.5+x*53,102.5+y*53,n,28,"#414848",'font-weight="bold"'))).join("")+text(598.5,314.5,5,28,"#496E9A")+[1,2,4].map(n=>text(474+(n-1)%3*16,297+Math.floor((n-1)/3)*16,n,11,"#777F80")).join("");
sudoku+=line(198,125,198,509,"#B8C9CF")+line(1000,125,1000,509,"#B8C9CF");
art.set("sudoku",svg(sudoku));

// Complete 1–100 alternating route and exact fixed snake/ladder map. Numbers
// render last on small paper patches; every traversal endpoint remains readable.
const ladders=[[1,38],[4,14],[9,31],[21,42],[28,84],[36,44],[51,67],[71,91],[80,100]];
const snakes=[[16,6],[47,26],[49,11],[56,53],[62,19],[64,60],[87,24],[93,73],[95,75],[98,78]];
assert.equal(new Set([...ladders,...snakes].flat()).size,38);
const position=n=>{const row=Math.floor((n-1)/10),col=row%2?9-(n-1)%10:(n-1)%10;return[375+col*50,540-row*50];};
let journey=paper("#F7EBD5")+rect(334,49,532,532,C.ochre)+many(100,i=>{const[x,y]=position(i+1);return rect(x-25,y-25,50,50,(Math.floor(i/10)+i%10)%2?"#ECDFC1":"#F9EFD9",0,'stroke="#C2B28D" stroke-width=".8"');});
ladders.forEach(([a,b])=>{const[x,y]=position(a),[xx,yy]=position(b),dx=xx-x,dy=yy-y,length=Math.hypot(dx,dy),nx=-dy/length*6,ny=dx/length*6,n=Math.max(2,Math.round(length/18));journey+=line(x+nx,y+ny,xx+nx,yy+ny,"#A8783C",3)+line(x-nx,y-ny,xx-nx,yy-ny,"#A8783C",3)+many(n,i=>{const t=(i+.5)/n;return line(x+dx*t+nx,y+dy*t+ny,x+dx*t-nx,y+dy*t-ny,"#A8783C");});});
snakes.forEach(([a,b],i)=>{const[x,y]=position(a),[xx,yy]=position(b),mx=(x+xx)/2+(i%2?16:-16),my=(y+yy)/2,color=i%2?"#638269":"#AA654E",d=`M${x} ${y}Q${mx+18} ${my-20} ${mx} ${my}T${xx} ${yy}`;journey+=path(d,"none",color,8)+path(d,"none",C.cream,1.5,'stroke-dasharray="2 7"')+circle(x,y,5,color)+circle(x+1,y-2,1.2,C.cream)+circle(xx,yy,2,color);});
journey+=many(100,i=>{const[x,y]=position(i+1);return rect(x-23,y-23,20+(i===99?5:0),14,"#F9F0DD",2)+text(x-12,y-15,i+1,10.5,C.ink);})+many(10,i=>motif(303,92+i*50,C.rust)+motif(897,92+i*50,C.teal))+token(240,525,0,16)+token(260,565,1,16);
art.set("snakes-and-ladders",svg(journey));

assert.equal(art.size,12);
for (const [id, body] of await newQuickPlayArt()) art.set(id, body);
assert.equal(art.size,24);
const source=new URL("../assets/quick-play/styles/",import.meta.url),output=new URL("../public/images/quick-play/styles/",import.meta.url);
await mkdir(source,{recursive:true});await mkdir(output,{recursive:true});
const sceneNames={chess:"chess-neem-courtyard",carrom:"carrom-veranda-club",ludo:"ludo-family-courtyard"};
for(const[id,body]of art){const buffer=await sharp(Buffer.from(body)).webp({quality:90,effort:6}).toBuffer();assert(buffer.length<160*1024,`${id}: artwork exceeds 160 KiB`);await writeFile(new URL(`${id === "carrom" ? sceneNames[id] : id}.svg`,source),body+"\n");await writeFile(new URL(`${sceneNames[id]??id}.webp`,output),buffer);console.log(`${id}: ${buffer.length} bytes`);}
await mkdir(new URL("keepsakes/",output),{recursive:true});
for(const[id,body]of Object.entries(keepsakes))await writeFile(new URL(`keepsakes/${id}.svg`,output),svg(group(80,80,1,body),160,160)+"\n");
await writeFile(new URL("keepsakes/card-back.svg",output),svg(group(80,80,1,back),160,160)+"\n");
console.log("Generated 24 spec-directed illustrations and fifteen reusable keepsakes; original assets preserved.");
