import sharp from "sharp";
import path from "node:path";
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (...parts) => path.join(root, ...parts);
// Actual captures from gulamchor.vihar.online, not generated promotional scenes.
await sharp(at("assets/original/gulam-chor/landing.png")).webp({ quality: 88 }).toFile(at("public/images/gulam-chor/landing.webp"));
// Preserve the former public URL; new listings use the launch-specific path
// so caches cannot substitute the previous announcement illustration.
await copyFile(at("public/images/gulam-chor/landing.webp"), at("public/images/gulam-chor.webp"));
for (const name of ["table", "table-mobile"]) {
  await sharp(at(`assets/original/gulam-chor/${name}.png`)).webp({ quality: 88 }).toFile(at(`public/images/gulam-chor/${name}.webp`));
}
await sharp(at("assets/original/gulam-chor/landing.png")).resize(1200, 630, { fit: "cover" }).png({ palette: true, quality: 85, effort: 10 }).toFile(at("public/images/social-gulam-chor.png"));
console.log("Refreshed Gulam Chor's game artwork, gameplay screenshots and sharing image.");
