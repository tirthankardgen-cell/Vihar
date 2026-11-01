import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (name) => path.join(root, "assets/original", `bap-ka-rasta-${name}`);
const output = path.join(root, "public/images/bap-ka-rasta");
await mkdir(output, { recursive: true });

async function crop(file, name, rectangle, width) {
  let pipeline = sharp(source(file));
  if (rectangle) pipeline = pipeline.extract(rectangle);
  await pipeline.resize({ width, withoutEnlargement: true })
    .webp({ quality: 84, effort: 6 }).toFile(path.join(output, `${name}.webp`));
}

// These rectangles match the owner's city and vehicle selection artwork.
for (const [name, left, top] of [
  ["auto", 0, 0], ["thar", 512, 0], ["fortuner", 1024, 0],
  ["scooty", 0, 512], ["ktm", 512, 512],
]) await crop("vehicle-gallery.webp", name, { left, top, width: 512, height: 512 }, 512);
await sharp(source("toto.png")).flatten({ background: "#faf7ef" }).resize(512, 512)
  .webp({ quality: 84, effort: 6 }).toFile(path.join(output, "toto.webp"));

for (const [name, left, top, width] of [
  ["mumbai", 8, 145, 498], ["delhi", 514, 145, 502],
  ["kolkata", 1027, 145, 501], ["chennai", 8, 605, 498],
  ["bangalore", 514, 605, 502],
]) await crop("world-board.webp", name, { left, top, width, height: 344 }, width);

const characters = ["sachin", "raju", "meera", "sameer", "aarti", "imran", "lata", "patil"];
for (const [index, name] of characters.entries()) {
  await crop("main-cast.jpg", name, {
    left: 16 + (index % 4) * 400,
    top: 114 + Math.floor(index / 4) * 530,
    width: 384, height: 460,
  }, 384);
}
for (const [name, left] of [["taj", 18], ["gateway", 516], ["csmt", 1512]]) {
  await crop("landmarks.jpg", name, { left, top: 96, width: 480, height: 360 }, 480);
}
await crop("street-scale.jpg", "street-scene", { left: 0, top: 75, width: 1440, height: 850 }, 1100);

const files = [...characters, "auto", "thar", "fortuner", "scooty", "ktm", "toto", "mumbai", "delhi", "kolkata", "chennai", "bangalore", "taj", "gateway", "csmt", "street-scene"];
const bytes = (await Promise.all(files.map((name) => stat(path.join(output, `${name}.webp`))))).reduce((total, file) => total + file.size, 0);
console.log(`Generated ${files.length} game showcase images (${Math.round(bytes / 1024)} KiB) from the owner's original assets.`);
