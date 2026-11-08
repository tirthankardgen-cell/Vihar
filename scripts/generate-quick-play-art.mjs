import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// Original flat editorial illustrations, not gameplay screenshots. Keep all
// twelve reproducible without copying assets from the independent game host.
const ink = "#343c32", cream = "#fff8e8", rust = "#af573e", gold = "#d5a352", green = "#66816c";
const rect = (x, y, w, h, fill, radius = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
const circle = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, width = 4) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
const label = (x, y, value, size = 36, fill = ink) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="${size}" fill="${fill}">${value}</text>`;
const board = (n, cell, light, dark, x = 600 - n * cell / 2, y = 315 - n * cell / 2) => Array.from({ length: n * n }, (_, i) => rect(x + i % n * cell, y + Math.floor(i / n) * cell, cell, cell, (Math.floor(i / n) + i) % 2 ? dark : light)).join("");
const disc = (x, y, fill, r = 24) => circle(x, y, r, fill) + circle(x, y, r - 7, "none", `stroke="${fill === cream ? gold : cream}" stroke-width="2" opacity=".55"`);
const frame = (body, bg, accent) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${rect(0, 0, 1200, 630, bg)}<g opacity=".12" fill="none" stroke="${accent}" stroke-width="2"><circle cx="70" cy="100" r="210"/><circle cx="70" cy="100" r="182"/><circle cx="1160" cy="540" r="210"/><circle cx="1160" cy="540" r="182"/></g><g fill="${accent}" opacity=".35">${Array.from({ length: 5 }, (_, i) => circle(138 + i * 18, 510, 3, accent) + circle(990 + i * 18, 115, 3, accent)).join("")}</g>${body}</svg>`;
const art = new Map();

art.set("chess", frame(rect(344, 59, 512, 512, ink, 12) + board(8, 58, "#e2d5b5", "#91a18a") + `<g transform="translate(445 175)" fill="${cream}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"><path d="M-26 193H175L160 161H-8Z"/><path d="M12 154C-11 85 52 74 47 41L11 62L-6 32L45-23L51-67L88-38C144-36 170 59 154 154Z"/><path d="M76-24L116 2" fill="none"/>${circle(48, 2, 6, ink)}</g><g transform="translate(707 224)" fill="${ink}" stroke="${cream}" stroke-width="4">${rect(-52, 175, 134, 30, ink, 5)}<path d="M-38 166L-19 72H44L65 166Z"/><path d="M-30 61L-46 3L2 23L15-12L30 23L73 3L54 61Z"/>${line(15, -58, 15, -20, cream, 7)}${line(0, -43, 30, -43, cream, 7)}</g>`, "#e8e5d8", green));

art.set("carrom", frame(rect(335, 50, 530, 530, "#ae7549", 24) + rect(360, 75, 480, 480, "#edd6a5", 12) + rect(410, 125, 380, 380, "none", 26, `stroke="${rust}" stroke-width="3"`) + rect(425, 140, 350, 350, "none", 18, `stroke="${rust}" stroke-width="2"`) + [[385, 100], [815, 100], [385, 530], [815, 530]].map(([x, y]) => circle(x, y, 22, ink)).join("") + circle(600, 315, 72, "none", `stroke="${rust}" stroke-width="2"`) + [0, 1, 2, 3, 4, 5].map((i) => disc(600 + Math.cos(i * Math.PI / 3) * 42, 315 + Math.sin(i * Math.PI / 3) * 42, i % 2 ? cream : ink, 20)).join("") + disc(600, 315, rust, 20) + disc(505, 474, cream, 27), "#f2e8d7", rust));

art.set("billiards", frame(rect(244, 105, 712, 420, "#84543c", 42) + rect(267, 128, 666, 374, "#466b57", 25) + [[278, 139], [600, 132], [922, 139], [278, 491], [600, 498], [922, 491]].map(([x, y]) => circle(x, y, 22, "#26392d")).join("") + line(215, 467, 487, 351, "#e2bd84", 10) + circle(519, 337, 25, cream) + [[660, 250, gold, "1"], [725, 291, rust, "3"], [675, 330, ink, "8"], [779, 366, "#98afcf", "2"]].map(([x, y, c, number]) => circle(x, y, 27, c) + circle(x, y, 14, cream) + label(x, y + 1, number, 20)).join(""), "#e4e9dd", green));

art.set("checkers", frame(rect(350, 65, 500, 500, rust, 8) + board(8, 58, "#efdcc1", "#b66e50") + [[397, 112], [513, 112], [629, 112], [745, 112], [455, 170], [571, 170], [687, 170], [513, 228]].map(([x, y]) => disc(x + 0, y + 0, ink)).join("") + [[455, 460], [571, 460], [687, 460], [803, 460], [397, 518], [513, 518], [629, 518], [745, 518], [629, 344]].map(([x, y]) => disc(x, y, cream)).join(""), "#f1e3d6", rust));

art.set("connect-four", frame(rect(323, 95, 554, 440, ink, 22) + Array.from({ length: 42 }, (_, i) => circle(366 + i % 7 * 78, 140 + Math.floor(i / 7) * 70, 28, i > 25 ? (i % 3 ? rust : gold) : i === 21 || i === 16 ? gold : "#e6e3d2")).join("") + line(366, 490, 600, 280, cream, 3), "#e6e3d2", ink));

art.set("ludo", frame(rect(350, 65, 500, 500, cream, 14) + [[366, 81, rust], [638, 81, green], [366, 353, gold], [638, 353, "#718a9f"]].map(([x, y, color]) => rect(x, y, 196, 196, color, 8) + rect(x + 28, y + 28, 140, 140, cream, 12) + [[59, 59], [137, 59], [59, 137], [137, 137]].map(([dx, dy]) => disc(x + dx, y + dy, color, 20)).join("")).join("") + Array.from({ length: 6 }, (_, i) => rect(565, 80 + i * 39, 33, 33, "#e7dfcd", 3) + rect(604, 80 + i * 39, 31, 33, green, 3) + rect(565, 354 + i * 32, 33, 27, "#e7dfcd", 3) + rect(604, 354 + i * 32, 31, 27, gold, 3) + rect(366 + i * 39, 284, 33, 28, rust, 3) + rect(366 + i * 39, 318, 33, 28, "#e7dfcd", 3) + rect(638 + i * 33, 284, 27, 28, "#e7dfcd", 3) + rect(638 + i * 33, 318, 27, 28, "#718a9f", 3)).join("") + rect(552, 267, 96, 96, cream, 8) + circle(578, 293, 6, ink) + circle(622, 293, 6, ink) + circle(600, 315, 6, ink) + circle(578, 337, 6, ink) + circle(622, 337, 6, ink), "#ede7d8", rust));

art.set("reversi", frame(rect(350, 65, 500, 500, ink, 12) + board(8, 58, "#759079", "#759079") + Array.from({ length: 9 }, (_, i) => line(368, 83 + i * 58, 832, 83 + i * 58, "#526b57", 2) + line(368 + i * 58, 83, 368 + i * 58, 547, "#526b57", 2)).join("") + [[3, 2], [4, 2], [2, 3], [3, 3], [4, 3], [3, 4], [4, 4], [5, 4], [5, 5], [4, 6]].map(([x, y], i) => disc(397 + x * 58, 112 + y * 58, i % 3 ? cream : ink)).join(""), "#e5e8db", green));

const smallGrid = (kind) => {
  let body = rect(350, 65, 500, 500, cream, 14);
  if (kind === "sudoku") {
    body += Array.from({ length: 10 }, (_, i) => line(375 + i * 50, 90, 375 + i * 50, 540, i % 3 ? "#cec7b5" : ink, i % 3 ? 1.5 : 3) + line(375, 90 + i * 50, 825, 90 + i * 50, i % 3 ? "#cec7b5" : ink, i % 3 ? 1.5 : 3)).join("");
    const clues = ["53..7....", "6..195...", ".98....6.", "8...6...3", "4..8.3..1", "7...2...6", ".6....28.", "...419..5", "....8..79"];
    body += clues.flatMap((row, y) => [...row].map((value, x) => value === "." ? "" : label(400 + x * 50, 115 + y * 50, value, 33, (x + y) % 3 ? ink : rust))).join("");
  } else {
    body += Array.from({ length: 49 }, (_, i) => {
      const x = 375 + i % 7 * 65, y = 90 + Math.floor(i / 7) * 65, closed = i % 7 > 3 || i > 35;
      return rect(x, y, 60, 60, closed ? "#c5c9b6" : "#f0ede2", 5) + (i === 17 || i === 32 ? line(x + 22, y + 14, x + 22, y + 44, ink, 3) + `<path d="M${x + 23} ${y + 14}h22l-8 10 8 10h-22Z" fill="${rust}"/>` : !closed && i % 3 ? label(x + 30, y + 32, i % 3, 33, i % 3 === 1 ? "#597c95" : green) : "");
    }).join("");
  }
  return body;
};
art.set("sudoku", frame(smallGrid("sudoku"), "#eee7d9", rust));
art.set("minesweeper", frame(smallGrid("minesweeper"), "#e7e9de", green));

art.set("memory-match", frame(Array.from({ length: 8 }, (_, i) => {
  const x = 293 + i % 4 * 160, y = 118 + Math.floor(i / 4) * 204, open = [0, 2, 5, 7].includes(i);
  return rect(x, y, 140, 182, open ? cream : green, 13) + rect(x + 10, y + 10, 120, 162, "none", 8, `stroke="${open ? gold : cream}" stroke-width="2" opacity=".5"`) + (open ? circle(x + 70, y + 91, 27, i % 2 ? rust : gold) + Array.from({ length: 8 }, (_, j) => line(x + 70 + Math.cos(j * Math.PI / 4) * 37, y + 91 + Math.sin(j * Math.PI / 4) * 37, x + 70 + Math.cos(j * Math.PI / 4) * 47, y + 91 + Math.sin(j * Math.PI / 4) * 47, i % 2 ? rust : gold, 3)).join("") : `<path d="M${x + 70} ${y + 43}l32 48-32 48-32-48Z" fill="none" stroke="${cream}" stroke-width="3"/>`);
}).join(""), "#ece4d6", gold));

art.set("tic-tac-toe", frame(rect(308, 57, 584, 516, cream, 4) + Array.from({ length: 13 }, (_, i) => line(328, 84 + i * 39, 872, 84 + i * 39, "#dedfd4", 1)).join("") + line(366, 70, 366, 557, "#d1a396", 2) + line(529, 148, 524, 487, ink, 7) + line(659, 145, 668, 491, ink, 7) + line(404, 260, 783, 267, ink, 7) + line(402, 378, 788, 371, ink, 7) + [[460, 202], [590, 318], [730, 431]].map(([x, y]) => line(x - 27, y - 31, x + 29, y + 30, rust, 13) + line(x + 30, y - 31, x - 27, y + 31, rust, 13)).join("") + circle(724, 203, 35, "none", `stroke="${green}" stroke-width="11"`) + circle(459, 431, 35, "none", `stroke="${green}" stroke-width="11"`) + line(421, 163, 764, 462, rust, 3), "#f0e5dd", rust));

let snakes = rect(350, 65, 500, 500, cream, 12) + board(5, 92, "#e9d9aa", "#bacaa3");
snakes += Array.from({ length: 25 }, (_, i) => label(385 + i % 5 * 92, 105 + Math.floor(i / 5) * 92, 100 - i, 19, "#5d6954")).join("");
snakes += `<path d="M735 149C805 211 650 260 692 326S513 383 475 470" fill="none" stroke="${green}" stroke-width="25" stroke-linecap="round"/>${circle(735, 149, 20, green)}${circle(731, 140, 3, cream)}`;
snakes += line(427, 434, 561, 152, rust, 8) + line(470, 449, 603, 172, rust, 8) + Array.from({ length: 7 }, (_, i) => line(434 + i * 18, 415 - i * 38, 477 + i * 18, 431 - i * 38, rust, 5)).join("");
art.set("snakes-and-ladders", frame(snakes, "#e8eadc", green));

const output = new URL("../public/images/quick-play/", import.meta.url);
await mkdir(output, { recursive: true });
for (const [id, svg] of art) {
  await writeFile(new URL(`${id}.png`, output), await sharp(Buffer.from(svg)).png({ palette: true }).toBuffer());
}
console.log(`Generated ${art.size} original Quick Play illustrations (1200 × 630).`);
