import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Run explicitly after production deployment, never during builds. IndexNow
// notifies participating search engines; it cannot guarantee indexing or rank.
const origin = new URL(process.env.SITE_URL || "https://vihar.online").origin;
assert(origin.startsWith("https://"), "Use the canonical HTTPS origin");
const key = (await readFile(new URL("../public/indexnow-key.txt", import.meta.url), "utf8")).trim();
assert(/^[a-f0-9]{32}$/.test(key), "Invalid IndexNow verification key");
const keyLocation = `${origin}/indexnow-key.txt`;
const options = { signal: AbortSignal.timeout(30000) };
const keyResponse = await fetch(keyLocation, options);
assert(keyResponse.ok && (await keyResponse.text()).trim() === key, "Deploy and verify the public key before submitting");
const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(30000) });
assert(sitemapResponse.ok, "The live sitemap must be accessible");
const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
assert(urlList.length > 0 && urlList.length <= 10000, "Expected 1–10,000 canonical URLs");
assert(urlList.every((url) => new URL(url).origin === origin), "Only submit this site's URLs");
if (process.argv.includes("--dry-run")) {
  console.log(`Verified the live key and ${urlList.length} URLs on ${origin}. No submission sent.`);
} else {
  const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList }), signal: AbortSignal.timeout(30000) });
  assert([200, 202].includes(response.status), `IndexNow rejected the submission (${response.status})`);
  console.log(`IndexNow ${response.status}: ${urlList.length} URLs received${response.status === 202 ? "; key validation pending" : ""}. Indexing is decided by participating search engines.`);
}
