import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Original editorial covers following section 5 of the twelve new spec.md files.
// These illustrations preview the style; they are not screenshots or game state.
const rect = (x, y, w, h, fill, stroke = "none", radius = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="${radius}" ${extra}/>`;
const line = (x, y, xx, yy, ink, width = 2, extra = "") => `<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${ink}" stroke-width="${width}" ${extra}/>`;
const path = (d, fill, ink = "none", width = 2, extra = "") => `<path d="${d}" fill="${fill}" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (x, y, r, fill, ink = "none", extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}" ${extra}/>`;
const label = (x, y, value, ink, size = 24) => `<text x="${x}" y="${y}" fill="${ink}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="middle" dominant-baseline="central">${value}</text>`;
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");
const group = (x, y, scale, body) => `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
const svg = (paper, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${rect(0, 0, 1200, 630, paper)}${body}</svg>`;
const grid = (x, y, cols, rows, size, paper, ink) => rect(x, y, cols * size, rows * size, paper, ink) + many(cols + 1, i => line(x + i * size, y, x + i * size, y + rows * size, ink, .8)) + many(rows + 1, i => line(x, y + i * size, x + cols * size, y + i * size, ink, .8));
const leaf = (x, y, color, stem) => group(x, y, 1, path("M0 0Q-30-40 0-68Q30-40 0 0Z", color, stem) + path("M0-7V-55M0-23l-12-13M0-37l12-12", "none", stem, 1));
const swallow = path("M-8 2-38-19 3-9 41-13 16 5 2 10Z", "#F8F1E4", "#2C445C", 1.6) + path("M-8 2 3-9 16 5 2 10Z", "#2C445C") + path("M-8 2-27 24-13 19-10 29 2 10Z", "#BCD4DE", "#2C445C", 1.4) + path("m15 0 11 2-10 3", "#B96054") + circle(13, -1, 1.7, "#F8F1E4") + circle(0, 4, 2.1, "#B39357");

export async function newQuickPlayArt() {
  const art = new Map();
  let airmail = rect(208, 58, 784, 514, "#F8F1E4", "#2C445C", 5) + rect(223, 73, 754, 484, "none", "#B96054", 0, 'stroke-width="3" stroke-dasharray="15 18"') + rect(245, 95, 710, 331, "#D8E7EB");
  airmail += path("M245 350q80-58 150-10 65-70 133-12 92-55 160 0 90-52 267 17v81H245Z", "#E8EFF0") + path("M310 330Q450 170 602 242T859 169", "none", "#B39357", 2, 'stroke-dasharray="5 8"') + group(592, 239, 3.8, swallow);
  airmail += many(3, i => line(284, 469 + i * 23, 531 - i * 27, 469 + i * 23, "#2C445C", 1)) + rect(824, 456, 87, 82, "#BCD4DE", "#2C445C", 0, 'stroke-dasharray="3 3"') + group(867, 487, .7, swallow) + label(867, 522, "AIR POST", "#2C445C", 10);
  art.set("paperwing", svg("#BCD4DE", airmail));

  let silk = rect(329, 44, 542, 542, "#A8BA97", "#304B3B") + grid(350, 65, 12, 12, 42, "#F5EFDC", "#A8BA97");
  const trail = [[3, 8], [3, 7], [3, 6], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [7, 4], [7, 3], [6, 3], [5, 3]];
  silk += trail.map(([x, y], i) => rect(354 + x * 42, 69 + y * 42, 34, 34, "#304B3B", "none", 9) + (i < trail.length - 1 ? line(365 + x * 42, 86 + y * 42, 376 + x * 42, 86 + y * 42, "#A8BA97", 1) : circle(365 + x * 42, 81 + y * 42, 2.5, "#F5EFDC") + circle(365 + x * 42, 92 + y * 42, 2.5, "#F5EFDC"))).join("");
  silk += leaf(770, 438, "#A8BA97", "#A45E47") + many(15, i => line(337, 57 + i * 36, 345, 65 + i * 36, "#F5EFDC")) + leaf(227, 325, "#A8BA97", "#A45E47") + leaf(984, 477, "#A8BA97", "#A45E47");
  art.set("silk-trail", svg("#F5EFDC", silk));

  let rain = grid(450, 58, 10, 20, 26, "#EEE9DF", "#A5B4B6");
  const shapes = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[2, 0], [0, 1], [1, 1], [2, 1]]];
  const swatches = ["#5D8195", "#C39551", "#806A85", "#619787", "#B56864", "#829BA3", "#806A85"];
  shapes.forEach((shape, i) => { const x = i < 5 ? 450 + i % 2 * 130 : 236, y = i < 5 ? 450 + Math.floor(i / 2) * 40 : 182 + (i - 5) * 115; rain += shape.map(([xx, yy]) => rect(x + xx * 26, y + yy * 26, 25, 25, swatches[i], "#263B49") + line(x + xx * 26 + 5, y + yy * 26 + 5, x + xx * 26 + 18, y + yy * 26 + 18, "#EEE9DF", .8)).join(""); });
  rain += group(527, 180, 1, shapes[2].map(([x, y]) => rect(x * 26, y * 26, 25, 25, "#806A85", "#263B49")).join("")) + many(13, i => line(850 + i % 4 * 24, 150 + i * 22, 841 + i % 4 * 24, 171 + i * 22, "#5D8195", 1));
  art.set("monsoon-blocks", svg("#EEE9DF", rain));

  const fox = path("M-78 12-110-25-62-10-42-34 9-40 25-65 32-32 57-56 54-20 78-8 49 10 21 12 2 39-9 40-5 13-43 18-58 38-69 37Z", "#B56843", "#463D32", 2) + path("M-78 12-110-25-87-17-70 7Z", "#F2E5CB") + circle(48, -19, 2.8, "#463D32");
  let desert = line(100, 456, 1100, 456, "#463D32", 2) + group(413, 407, 1.9, fox) + path("M826 455V342l34-19 35 23v109Z", "#B8AB77", "#463D32") + path("M964 456V378l26-17 33 22v73Z", "#B8AB77", "#463D32") + path("M131 509Q369 460 557 529T1113 509", "none", "#B8AB77", 2) + path("M713 185q20-19 40 0 20-19 40 0", "none", "#463D32", 2) + path("M171 245h133m569-13h166", "none", "#829BA3", 1.5);
  desert += many(6, i => path(`M${146 + i * 153} 480l-8-22m8 22 10-15`, "none", "#B8AB77", 2));
  art.set("dune-dash", svg("#F2E5CB", desert));

  let lantern = grid(420, 112, 5, 5, 78, "#F6EBDD", "#47384B");
  const stencil = [[1, 1, 0, 1, 1], [0, 1, 0, 1, 0], [0, 1, 1, 1, 0], [0, 1, 0, 1, 0], [1, 1, 0, 1, 1]];
  lantern += stencil.flatMap((row, y) => row.map((filled, x) => filled ? rect(424 + x * 78, 116 + y * 78, 70, 70, "#D1A24E") + line(431 + x * 78, 123 + y * 78, 443 + x * 78, 123 + y * 78, "#FFF9EE") : "")).join("");
  lantern += ["2 2", "1 1", "3", "1 1", "2 2"].map((n, i) => label(373, 151 + i * 78, n, "#47384B", 20)).join("") + ["1 1", "5", "1", "5", "1 1"].map((n, i) => label(459 + i * 78, 78, n, "#47384B", 20)).join("") + path("M211 156v105m-18 0h36m-28 12v50m20-50v50M965 280v105m-18 0h36m-28 12v50m20-50v50", "none", "#AB615A", 3);
  art.set("lantern-logic", svg("#F6EBDD", lantern));

  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
  let mosaic = tiles.map((n, i) => { const x = 354 + i % 4 * 123, y = 68 + Math.floor(i / 4) * 123; return rect(x, y, 114, 114, "#F4EFE3", n ? "#355E82" : "#3B454B", 0, n ? 'stroke-width="2"' : 'stroke-dasharray="7 7"') + (n ? path(`M${x + 17} ${y + 86}q13-36 26 0 13-36 26 0 13-36 26 0`, "none", i % 2 ? "#698D88" : "#B47758", 2) + label(x + 57, y + 38, n, "#355E82", 29) : ""); }).join("");
  mosaic += path("M231 146q-38 80 0 160q38-80 0-160M968 331q-38 80 0 160q38-80 0-160", "none", "#698D88", 3);
  art.set("mosaic-shift", svg("#F4EFE3", mosaic));

  let optical = grid(372, 89, 7, 7, 65, "#EFECE4", "#89989B");
  optical += path("M340 251H534V446H860", "none", "#B98B3C", 5) + path("M664 58V381H340", "none", "#497F98", 4, 'stroke-dasharray="10 5"');
  [[534, 251, false], [534, 446, false], [664, 381, true]].forEach(([x, y, slash]) => { optical += rect(x - 23, y - 23, 46, 46, "#EFECE4", "#283F47") + line(x - 17, y + (slash ? 17 : -17), x + 17, y + (slash ? -17 : 17), "#283F47", 4); });
  optical += circle(863, 446, 22, "#EFECE4", "#B98B3C", 'stroke-width="3"') + label(863, 446, "A", "#283F47", 18) + circle(332, 381, 22, "#EFECE4", "#497F98", 'stroke-width="3"') + label(332, 381, "B", "#283F47", 18) + label(320, 251, "A →", "#283F47", 19) + label(664, 39, "B", "#283F47", 19);
  art.set("prism-paths", svg("#EFECE4", optical));

  let market = grid(350, 65, 8, 8, 62, "#F0E7D4", "#D0C3A6");
  const map = ["########", "#......#", "#.##...#", "#......#", "#..#...#", "#......#", "#......#", "########"];
  market += map.flatMap((row, y) => [...row].map((cell, x) => cell === "#" ? rect(350 + x * 62, 65 + y * 62, 62, 62, "#344A69") : "")).join("");
  [[2, 3], [5, 4], [4, 6]].forEach(([x, y]) => { market += rect(357 + x * 62, 72 + y * 62, 48, 48, "#E8D4B4", "#A86C4E", 0, 'stroke-width="3"') + group(381 + x * 62, 110 + y * 62, .32, leaf(0, 0, "#758C65", "#A86C4E")); });
  [[5, 2], [2, 5], [6, 6]].forEach(([x, y]) => { market += circle(381 + x * 62, 96 + y * 62, 18, "none", "#758C65", 'stroke-width="2"') + path(`M${374 + x * 62} ${96 + y * 62}h14m-7-7v14`, "none", "#758C65", 2); });
  market += circle(443, 282, 17, "#C29D46", "#344A69") + path("M443 265l-6 8h12Z", "#344A69") + many(5, i => rect(140 + i * 25, 133, 25, 100, i % 2 ? "#F0E7D4" : "#C29D46"));
  art.set("crate-courtyard", svg("#F0E7D4", market));

  let brass = "";
  [[330, 234, 180, 270, 1, 3, "A"], [673, 114, 196, 390, 4, 5, "B"]].forEach(([x, y, w, h, volume, capacity, name]) => {
    brass += rect(x, y, w, h, "#E4D5AE", "#493D2F", 8, 'stroke-width="2"') + rect(x + 2, y + h * (1 - volume / capacity), w - 4, h * volume / capacity - 2, "#5B959A") + many(capacity + 1, i => line(x + w - 18, y + i * h / capacity, x + w - 3, y + i * h / capacity, "#493D2F", 1)) + label(x + w / 2, y - 26, `${name} · ${capacity} L`, "#493D2F", 24) + label(x + w / 2, 547, `${volume} L`, "#493D2F", 27);
  });
  brass += line(643, 192, 690, 192, "#493D2F", 2) + label(626, 192, "4", "#493D2F", 20) + line(235, 579, 965, 579, "#B49351", 1);
  art.set("tide-turn", svg("#F5EDDC", brass));

  const holes = [];
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if ((x >= 2 && x <= 4) || (y >= 2 && y <= 4)) holes.push([x, y]);
  assert.equal(holes.length, 33);
  let river = path("M478 66H722V214H870V458H722V606H478V458H330V214H478Z", "#D8E1D5", "#344A4C", 2);
  river += holes.map(([x, y]) => { const xx = 372 + x * 76, yy = 105 + y * 76; return circle(xx, yy, 23, "none", "#78917C") + (x === 3 && y === 3 ? circle(xx, yy, 16, "none", "#344A4C", 'stroke-dasharray="4 4"') : `<ellipse cx="${xx}" cy="${yy}" rx="20" ry="18" fill="#344A4C"/>` + path(`M${xx - 10} ${yy}q10-8 20 0`, "none", "#ABB7AD", 1)); }).join("");
  river += path("M174 413q-9-109 20-164m-20 130-32-65m32 35 31-68M1012 221q-5 81 17 147m-12-74-26-37", "none", "#78917C", 2);
  art.set("pebble-solitaire", svg("#EAEFE7", river));

  let chalk = grid(375, 90, 6, 6, 75, "#F0E9D9", "#C7BCB7");
  chalk += many(49, i => circle(375 + i % 7 * 75, 90 + Math.floor(i / 7) * 75, 2.5, "#493D4E")) + path("M450 165H750V465H450Z", "none", "#493D4E", 4);
  [[1, 1, 2], [2, 1, 1], [4, 1, 2], [2, 2, 0], [3, 3, 0], [1, 4, 2], [4, 4, 2]].forEach(([x, y, n]) => { chalk += label(412.5 + x * 75, 127.5 + y * 75, n, "#493D4E", 27); });
  [[243, 137], [943, 501]].forEach(([x, y]) => { chalk += group(x, y, 1, path("M0-40 40 0 0 40-40 0Z", "none", "#B88789", 2) + circle(0, 0, 17, "none", "#C5A367") + path("M-55 0H55M0-55V55", "none", "#C5A367", 1)); });
  art.set("rangoli-loops", svg("#F0E9D9", chalk));

  let celestial = rect(277, 53, 646, 524, "#243B50", "#BA985A") + many(25, i => { const x = 305 + i % 5 * 122, y = 91 + Math.floor(i / 5) * 44, hard = i < 10; return rect(x, y, 101, 31, i % 3 ? "#72A1A4" : "#BC796B", "#EDE7D6") + path(`M${x + 40} ${y + 15}h20m-10-6v12`, "none", "#243B50", 1) + circle(x + 84, y + 10, 2, "#243B50") + (hard ? circle(x + 92, y + 10, 2, "#243B50") : ""); });
  celestial += rect(461, 520, 161, 11, "#BA985A", "none", 2) + line(461, 514, 461, 537, "#EDE7D6") + line(622, 514, 622, 537, "#EDE7D6") + circle(697, 386, 9, "#EDE7D6") + path("M685 401 651 441 624 475", "none", "#72A1A4", 2, 'stroke-dasharray="2 7"') + many(18, i => circle(132 + i % 3 * 447, 120 + Math.floor(i / 3) * 74, 1.3, "#72A1A4"));
  art.set("orbit-breaker", svg("#243B50", celestial));

  // Preserve the exact deployed Carrom board and original veranda, adapted only
  // into a wide cover. Source files were compared with the live game's assets.
  const board = await readFile(new URL("../assets/quick-play/styles/carrom-board.svg", import.meta.url), "utf8");
  const veranda = await readFile(new URL("../public/images/quick-play/carrom-veranda.svg", import.meta.url), "utf8");
  const boardBody = board.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const verandaBody = veranda.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const carrom = `<svg x="0" y="0" width="1200" height="630" viewBox="0 0 1800 1100" preserveAspectRatio="xMidYMid slice">${verandaBody}</svg>` + rect(0, 0, 1200, 630, "#102f324d") + `<svg x="349" y="65" width="502" height="502" viewBox="0 0 600 600">${boardBody}</svg>`;
  art.set("carrom", svg("#173D3A", carrom));
  assert.equal(art.size, 13);
  return art;
}
