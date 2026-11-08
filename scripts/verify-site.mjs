import assert from "node:assert/strict";
import { get as httpGet } from "node:http";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import sharp from "sharp";

// Exercise the built HTTP site, including assets and links, rather than its source.
// The private server is stopped even when an assertion fails.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = "http://127.0.0.1:" + (process.env.VERIFY_PORT || "4179");
const canonical = new URL(process.env.SITE_URL || "https://vihar.online");
const gameUrl = process.env.BAP_KA_RASTA_URL || "https://rasta.vihar.online";
const gulamUrl = process.env.GULAM_CHOR_URL || "https://gulamchor.vihar.online";
const email = process.env.SUPPORT_EMAIL || "contact@vihar.online";
const preview = process.env.VERCEL_ENV === "preview";
const guidePath = "/guides/bap-ka-rasta-first-drive";
const galleryPath = "/games/bap-ka-rasta/screenshots";
const helpContent = await readFile(new URL("../src/lib/help.ts", import.meta.url), "utf8");
const helpRoutes = [...helpContent.matchAll(/slug: "([a-z-]+)"/g)].map((match) => `/help/${match[1]}`);
assert(helpRoutes.length >= 15, "Include the complete player, creator, developer and support guide library");
const routes = ["/", "/games", "/games/originals", "/games/community", "/games/bap-ka-rasta", "/games/gulam-chor", "/about", "/help", ...helpRoutes, "/contact", "/privacy", "/terms", guidePath, galleryPath, "/site-map"];
const indexableRoutes = routes;
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", new URL(base).port], {
  cwd: root,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
let log = "";
let spawnError;
server.stdout.on("data", (chunk) => { log += chunk; });
server.stderr.on("data", (chunk) => { log += chunk; });
server.on("error", (error) => { spawnError = error; });

const get = (route) => fetch(new URL(route, base), { signal: AbortSignal.timeout(20000), redirect: "manual" });
const decode = (value) => value.replaceAll("&amp;", "&");
function attribute(html, tag, key, value, target = "content") {
  const pattern = new RegExp("<" + tag + "\\b[^>]*" + key + '="' + value + '"[^>]*>', "i");
  const element = html.match(pattern)?.[0];
  return element?.match(new RegExp(target + '="([^"]*)"'))?.[1];
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null) throw new Error("Production server exited.\n" + log);
    if (log.includes("Ready in")) { ready = true; break; }
    await delay(500);
  }
  assert(ready, "Production server did not become ready.\n" + log);
  if (canonical.origin === "https://vihar.online") {
    // Node fetch does not preserve a custom Host; use HTTP directly for host routing.
    const redirect = await new Promise((resolve, reject) => {
      const request = httpGet(new URL("/games/gulam-chor?source=domain-check", base), { headers: { Host: "www.vihar.online" } }, (response) => {
        response.resume();
        resolve({ status: response.statusCode, location: response.headers.location });
      });
      request.on("error", reject);
      request.setTimeout(20000, () => request.destroy(new Error("Domain redirect timed out")));
    });
    assert.equal(redirect.status, 308, "www must permanently redirect when apex is configured");
    assert.equal(redirect.location, "https://vihar.online/games/gulam-chor?source=domain-check", "Domain redirect preserves paths and queries");
  }
  const titles = new Set();
  const descriptions = new Set();
  const localLinks = new Set();
  const shareImages = new Set();
  const pages = new Map();
  for (const route of routes) {
    const response = await get(route);
    assert.equal(response.status, 200, route + " must return HTTP 200");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert(!response.headers.has("x-powered-by"));
    const html = await response.text();
    pages.set(route, html);
    assert.equal(attribute(html, "meta", "name", "msvalidate.01"), process.env.BING_SITE_VERIFICATION || undefined, route + " Bing verification");
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, route + " needs exactly one h1");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = attribute(html, "meta", "name", "description");
    assert(title && !titles.has(title), route + " needs a unique title");
    assert(description && !descriptions.has(description), route + " needs a unique description");
    titles.add(title);
    descriptions.add(description);
    const pageCanonical = attribute(html, "link", "rel", "canonical", "href");
    assert(pageCanonical, route + " needs a canonical URL");
    assert.equal(new URL(decode(pageCanonical)).href, new URL(route, canonical).href, route + " canonical");
    const robots = attribute(html, "meta", "name", "robots");
    const noindex = preview || !indexableRoutes.includes(route);
    assert(robots && robots.includes(noindex ? "noindex" : "index"), route + " robots");
    if (!noindex) assert(!robots.includes("noindex"), route + " must be indexable");
    const social = attribute(html, "meta", "property", "og:image");
    assert(social, route + " sharing image");
    assert.equal(attribute(html, "meta", "property", "og:image:width"), "1200");
    assert.equal(attribute(html, "meta", "property", "og:image:height"), "630");
    shareImages.add(new URL(decode(social)).pathname);
    assert.equal(attribute(html, "meta", "name", "twitter:card"), "summary_large_image");
    let schemas = 0;
    for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(match[1]);
      assert.equal(data["@context"], "https://schema.org");
      assert(data["@type"]);
      schemas++;
    }
    assert(schemas >= 2, route + " needs organization and page structured data");
    for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
      const href = decode(match[1]);
      if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/_next/")) localLinks.add(href.split("#")[0]);
    }
    assert(!/<(?:iframe|audio|video)\b/i.test(html), route + " must not embed games or autoplay media");
    assert(!/src="https?:\/\/[^"]*rasta\./i.test(html), route + " must not preload the game");
  }
  for (const href of localLinks) {
    const response = await get(href);
    assert.equal(response.status, 200, "Broken local link: " + href);
    await response.body?.cancel();
  }
  const sdk = await get("/sdk/vihar-id.js");
  assert.equal(sdk.status, 200);
  assert.equal(sdk.headers.get("access-control-allow-origin"), "*");
  assert((await sdk.text()).includes("export function createViharId"));
  const connect = await get("/auth/connect");
  assert.equal(connect.headers.get("cross-origin-opener-policy"), "unsafe-none");
  assert(attribute(await connect.text(), "meta", "name", "robots")?.includes("noindex"));
  assert.equal((await get("/help/not-a-real-topic")).status, 404);
  const invalidApi = await fetch(new URL("/api/vihar-id/not-a-real-action", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(invalidApi.status, 404);
  assert.equal(invalidApi.headers.get("cache-control"), "no-store");
  assert(invalidApi.headers.get("x-robots-tag")?.includes("noindex"));
  for (const asset of shareImages) {
    const response = await get(asset);
    assert.equal(response.status, 200, "Missing sharing image: " + asset);
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert.equal(metadata.width, 1200, asset + " width");
    assert.equal(metadata.height, 630, asset + " height");
  }
  // Exercise the nine-card tunnel in the server HTML and both responsive formats.
  const home = pages.get("/");
  const primaryIcon = attribute(home, "link", "rel", "icon", "href");
  assert.equal(primaryIcon, "/brand/icon-192.png", "Advertise a Google-supported favicon larger than 48px");
  const iconResponse = await fetch(new URL(primaryIcon, base), { headers: { "User-Agent": "Googlebot-Image" }, signal: AbortSignal.timeout(20000) });
  assert.equal(iconResponse.status, 200, "Googlebot-Image must be able to fetch the favicon");
  assert.equal(iconResponse.headers.get("content-type"), "image/png");
  assert(!/noindex|noimageindex/i.test(iconResponse.headers.get("x-robots-tag") || ""));
  const iconBytes = Buffer.from(await iconResponse.arrayBuffer());
  const iconMetadata = await sharp(iconBytes).metadata();
  assert.equal(iconMetadata.width, 192);
  assert.equal(iconMetadata.height, 192);
  const directory = pages.get("/site-map");
  for (const route of routes) assert(directory.includes(`href="${route}"`), "Site map must link to " + route);
  for (const [route, html] of pages) assert(html.includes('href="/site-map"'), route + " must link to the site map");
  assert(directory.includes(new URL("/guide.html", gameUrl).href), "Expose the separate game's public guide");
  const hero = home.match(/<section\b[^>]*aria-labelledby="vihar-world-title"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert(hero, "Homepage needs the Vihar world hero");
  const heroImages = [...hero.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(heroImages.length, 9, "The tunnel needs nine image cards");
  assert(hero.includes('href="/games"'), "The hero must expose the games catalogue");
  assert(hero.includes('href="/dashboard/publish"'), "The hero must expose community publishing");
  const formatBudgets = new Map([["image/avif", 0], ["image/webp", 0]]);
  for (const image of heroImages) {
    const alt = image.match(/\balt="([^"]*)"/i)?.[1];
    assert(alt?.trim(), "Every homepage tunnel image needs descriptive alt text");
    const srcset = image.match(/\bsrcSet="([^"]+)"/i)?.[1];
    assert(srcset && image.includes('sizes="'), "Every hero image needs responsive sizing");
    const candidates = decode(srcset).split(",").map((candidate) => candidate.trim().split(/\s+/));
    const [url, descriptor] = candidates.find(([, width]) => Number.parseInt(width) >= 360) ?? [];
    assert(url && Number.parseInt(descriptor) <= 640, "Hero cards need an appropriate mobile source");
    const original = new URL(url, base).searchParams.get("url");
    assert(original?.startsWith("/images/"), "Hero artwork must use local game assets");
    const originalResponse = await get(original);
    assert.equal(originalResponse.status, 200, "Missing original hero asset: " + original);
    const originalMetadata = await sharp(Buffer.from(await originalResponse.arrayBuffer())).metadata();
    for (const format of formatBudgets.keys()) {
      const response = await fetch(new URL(url, base), { headers: { Accept: format }, signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200, "Missing responsive hero asset: " + url);
      assert.equal(response.headers.get("content-type"), format, "Hero must negotiate the requested format");
      assert(response.headers.get("cache-control")?.includes("max-age="), "Optimized hero images need cache headers");
      const buffer = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(buffer).metadata();
      assert.equal(metadata.width, Number.parseInt(descriptor), "Hero srcset must describe its actual width");
      assert(Math.abs(metadata.height - metadata.width * originalMetadata.height / originalMetadata.width) <= 1, `Hero sources must keep their original proportions: ${original} (${originalMetadata.width}×${originalMetadata.height} → ${metadata.width}×${metadata.height})`);
      formatBudgets.set(format, formatBudgets.get(format) + buffer.length);
    }
  }
  // Aggregate budget replaces the former 25 KiB single courtyard image budget.
  for (const [format, bytes] of formatBudgets) assert(bytes <= 128 * 1024, "All nine mobile hero images must stay within 128 KiB: " + format);
  const heroPreviewResponse = await get("/preview/vihar-world");
  assert.equal(heroPreviewResponse.status, 200, "Hero preview must remain testable");
  const heroPreview = await heroPreviewResponse.text();
  assert(attribute(heroPreview, "meta", "name", "robots")?.includes("noindex"), "The hero preview must stay out of search results");
  assert.equal([...heroPreview.matchAll(/data-world-card=/g)].length, 9, "The preview must use the same nine-card hero");
  const homeStylesheets = [...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => decode(match[1]));
  let homeCssBytes = 0;
  for (const url of new Set(homeStylesheets)) {
    const response = await get(url);
    assert.equal(response.status, 200, "Missing homepage stylesheet: " + url);
    homeCssBytes += (await response.arrayBuffer()).byteLength;
  }
  // The animated tunnel adds a scoped stylesheet; obsolete courtyard styles are removed.
  assert(homeCssBytes > 0 && homeCssBytes <= 64 * 1024, "Homepage CSS, including community discovery, must stay within 64 KiB uncompressed");
  for (const asset of [
    "/images/courtyard.webp", "/images/playground.webp", "/images/bap-ka-rasta-cover.webp",
    "/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp", "/images/gulam-chor.webp",
    "/fonts/dm-sans-latin.woff2", "/fonts/newsreader-latin.woff2", "/fonts/newsreader-latin-medium.woff2", "/fonts/newsreader-latin-italic.woff2",
    "/brand/vihar-horizontal.svg", "/brand/vihar-emblem.svg", "/brand/vihar-avatar.png",
    "/brand/icon-192.png", "/brand/icon-512.png", "/brand/maskable-512.png",
  ]) {
    const response = await get(asset);
    assert.equal(response.status, 200, "Missing asset: " + asset);
    assert(Number(response.headers.get("content-length")) > 0, "Empty asset: " + asset);
    await response.body?.cancel();
  }
  const manifest = await (await get("/manifest.webmanifest")).json();
  assert.equal(manifest.short_name, "Vihar");
  assert.equal(manifest.display, "browser");
  for (const icon of manifest.icons) {
    const response = await get(icon.src);
    assert.equal(response.status, 200);
    await response.body?.cancel();
  }
  const robots = await (await get("/robots.txt")).text();
  assert(robots.includes(preview ? "Disallow: /" : "Allow: /"), "robots.txt must match the deployment environment");
  if (!preview) {
    assert(robots.includes(new URL("/sitemap.xml", canonical).href));
    for (const bot of ["bingbot", "Googlebot", "Googlebot-Image"]) assert(robots.includes(`User-Agent: ${bot}`), `Explicit crawler access: ${bot}`);
  }
  for (const path of ["/games/originals", "/games/community"]) {
    assert(home.includes(`href="${path}"`), "Collection links must be in server HTML");
    assert(pages.get(path).includes("CollectionPage"), "Collections need structured data");
  }
  assert(pages.get("/games").includes("Recommended games"), "Game discovery includes recommendations before JavaScript");
  assert(!pages.get("/games").includes("The next favourite starts with you"), "Do not render a fake ranking placeholder");
  const sitemap = await (await get("/sitemap.xml")).text();
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  assert.deepEqual(locations.filter((path) => !path.startsWith("/community/")).sort(), [...indexableRoutes].sort(), "Sitemap must contain all completed game and information pages");
  assert(locations.every((path) => indexableRoutes.includes(path) || /^\/community\/[A-Za-z0-9_-]+$/.test(path)), "Sitemap must not expose account or draft routes");
  const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  assert(sitemapEntries.length > 0, "Sitemap must contain URL entries");
  for (const entry of sitemapEntries) {
    assert(entry.includes("<changefreq>daily</changefreq>"), "Every public entry has the requested daily hint");
    assert(entry.includes("<priority>1</priority>"), "Every public entry has maximum priority");
  }
  const gulamEntry = sitemapEntries.find((entry) => entry.includes(`<loc>${canonical.origin}/games/gulam-chor</loc>`));
  assert(gulamEntry, "The playable Gulam Chor page must be discoverable");
  assert(gulamEntry.includes("<lastmod>2026-11-08T00:00:00+05:30</lastmod>"), "Preserve the actual game-content date, not the request date");
  assert(gulamEntry.includes("/images/social-gulam-chor.png"), "Gulam Chor sharing artwork is discoverable");
  assert(sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), "Image sitemap namespace");
  const imageLocations = [...sitemap.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((match) => new URL(decode(match[1])));
  assert(imageLocations.length >= 10, "Relevant pages need image sitemap entries");
  for (const url of new Map(imageLocations.map((url) => [url.href, url])).values()) {
    assert.equal(url.protocol, "https:", "Sitemap images must use HTTPS");
    if (url.origin !== canonical.origin) continue; // Community artwork remains on its publisher’s host.
    const response = await get(url.pathname);
    assert.equal(response.status, 200, "Missing sitemap image: " + url.pathname);
    const info = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert(info.width > 0 && info.height > 0, "Sitemap image must decode");
  }
  const gallery = pages.get(galleryPath);
  const gallerySchema = [...gallery.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((data) => data["@type"] === "ImageGallery");
  assert.equal(gallerySchema?.image.length, 57, "Gallery must describe gameplay, map, cities, rides, characters and world renders");
  for (const image of gallerySchema.image) {
    const imagePath = new URL(image.contentUrl).pathname;
    assert(gallery.includes(`href="${imagePath}"`), "Every gallery image needs a crawlable full-size link");
    assert(imageLocations.some((url) => url.href === image.contentUrl), "Every gallery image needs a sitemap entry");
    const markup = [...gallery.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
    assert(markup.some((tag) => decode(tag).includes(encodeURIComponent(imagePath)) && tag.includes('alt="')), "Gallery image must appear in server HTML");
  }
  for (const route of ["/games/bap-ka-rasta", guidePath]) assert(pages.get(route).includes(`href="${galleryPath}"`), "Gallery must be linked from " + route);
  assert(pages.get("/").includes('href="' + gameUrl + '"'), "Homepage must use the configured game URL");
  assert(pages.get("/games/bap-ka-rasta").includes('href="' + gameUrl + '"'), "Game detail must use the configured game URL");
  const gulam = pages.get("/games/gulam-chor");
  assert(gulam.includes('href="' + gulamUrl + '"'), "Gulam Chor must launch its configured independent website");
  assert(!gulam.includes('href="' + gameUrl + '"'), "Gulam Chor must not launch Bap Ka Rasta");
  assert(!gulam.includes("Coming soon"), "Released Gulam Chor must not be labelled coming soon");
  const gulamSchema = [...gulam.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((data) => data["@type"] === "VideoGame");
  assert.equal(gulamSchema?.offers.url, gulamUrl, "Gulam Chor game schema must use its own play destination");
  assert.equal(gulamSchema?.playMode, "SinglePlayer", "Virtual family preview must describe the supported player mode");
  assert.equal(gulamSchema?.screenshot.length, 2, "Gulam Chor needs desktop and mobile gameplay captures");
  for (const shot of gulamSchema.screenshot) {
    assert(gulam.includes(`href="${new URL(shot.contentUrl).pathname}"`), "Gameplay screenshots need full-size links");
    assert(imageLocations.some((url) => url.href === shot.contentUrl), "Gulam Chor screenshots must be included in the image sitemap");
  }
  for (const [oldPath, newPath] of [["/games/ekka-chor", "/games/gulam-chor"], ["/images/ekka-chor.webp", "/images/gulam-chor.webp"], ["/images/social-ekka-chor.png", "/images/social-gulam-chor.png"]]) {
    const response = await get(oldPath);
    assert.equal(response.status, 308, "Renamed content must redirect permanently: " + oldPath);
    assert.equal(new URL(response.headers.get("location"), base).pathname, newPath);
    await response.body?.cancel();
  }
  for (const [route, html] of pages) assert(!html.includes("Ekka"), "Old game name must not appear on " + route);
  assert(pages.get("/contact").includes('href="mailto:' + email + '"'), "Contact must use the configured mailbox");
  const publisher = (process.env.ADSENSE_PUBLISHER_ID ?? "ca-pub-6693217545827146").trim();
  const adScriptExpected = process.env.ADSENSE_ENABLED === "true" && process.env.ADSENSE_SITE_APPROVED === "true" && process.env.ADSENSE_CONSENT_READY === "true" && !preview;
  for (const [route, html] of pages) {
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert(head, route + " must contain a head");
    const scripts = [...head.matchAll(/<script\b[^>]*src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"\s]*"[^>]*>/g)];
    const allowed = adScriptExpected && route === guidePath;
    assert.equal(scripts.length, allowed ? 1 : 0, route + " AdSense script count in head");
    assert.equal([...html.matchAll(/<script\b[^>]*src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"\s]*"[^>]*>/g)].length, allowed ? 1 : 0, route + " must not duplicate the loader outside the head");
    if (allowed) {
      assert(scripts[0][0].includes(`client=${publisher}`), route + " AdSense publisher");
      assert(/\basync(?:=""|(?=\s|>))/.test(scripts[0][0]), route + " async script");
      assert(/crossorigin="anonymous"/i.test(scripts[0][0]), route + " cross-origin mode");
    } else assert(!html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"));
  }
  assert(pages.get("/privacy").includes(adScriptExpected ? "This site loads Google AdSense on the first-drive guide." : "The advertising loader is currently disabled."), "Privacy notice must match advertising mode");
  assert.equal(pages.get(guidePath).includes('id="privacy-choices"'), adScriptExpected, "Consent choices must accompany the advertising loader");
  assert(pages.get("/privacy").includes("prior visits to this website or other websites"), "Privacy must disclose cross-site advertising cookies");
  assert(pages.get("/privacy").includes("https://optout.aboutads.info/"), "Privacy must explain other vendor choices");
  const guide = pages.get(guidePath);
  assert(guide.includes("<article"), "The guide must contain server-rendered publisher content");
  for (const id of ["start", "handling", "explore", "camera", "recover", "devices", "scope"]) {
    assert(guide.includes(`id="${id}"`), "Missing guide section: " + id);
  }
  for (const route of ["/", "/games/bap-ka-rasta"]) assert(pages.get(route).includes(`href="${guidePath}"`), route + " must expose the guide");
  // A query must not change the ad/content policy, and nested missing pages
  // must never inherit the successful article's loader.
  const guideWithQuery = await (await get(guidePath + "?from=home")).text();
  assert.equal(guideWithQuery.includes('id="google-adsense"'), adScriptExpected);
  for (const route of [guidePath + "/missing", "/games/missing"]) {
    const response = await get(route);
    assert.equal(response.status, 404, route);
    assert(!(await response.text()).includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), route + " must not load ads");
  }
  const account = attribute(pages.get("/"), "meta", "name", "google-adsense-account");
  assert.equal(account, publisher && !preview ? publisher : undefined);
  const adsResponse = await get("/ads.txt");
  assert.equal(adsResponse.status, 200);
  const adsText = await adsResponse.text();
  if (publisher && !preview) assert.equal(adsText.trim(), `google.com, ${publisher.replace("ca-", "")}, DIRECT, f08c47fec0942fa0`);
  else assert(!adsText.includes("DIRECT"));
  const llms = await get("/llms.txt");
  assert.equal(llms.status, 200);
  assert((await llms.text()).includes(new URL("/help", canonical).href));
  const homepage = pages.get("/");
  assert(homepage.includes('id="faqs"'), "Homepage needs a visible FAQ destination");
  assert(homepage.includes("Frequently asked questions"), "Homepage FAQ heading");
  assert(homepage.includes('href="/#faqs"'), "Navigation must link to FAQs");
  assert(/<details[^>]*open=""/.test(homepage), "First homepage answer must be open initially");
  const help = pages.get("/help");
  const faq = [...help.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((data) => data["@type"] === "FAQPage");
  assert(faq && faq.mainEntity.length === 7, "Visible discovery FAQ schema");
  for (const question of faq.mainEntity) {
    assert(homepage.includes(question.name));
    assert(homepage.includes(question.acceptedAnswer.text));
    assert(help.includes(question.name));
    assert(help.includes(question.acceptedAnswer.text));
  }
  // Confirm the favicon is an undistorted resize of the actual source pixels.
  const original = await sharp(path.join(root, "logo.png")).extract({ left: 584, top: 160, width: 368, height: 368 }).png().toBuffer();
  const expectedIcon = await sharp(original).resize(48, 48, { fit: "contain" }).raw().toBuffer();
  const actualIcon = await sharp(await readFile(path.join(root, "public/brand/favicon-48.png"))).raw().toBuffer();
  assert.deepEqual(actualIcon, expectedIcon, "Favicon must match the original emblem pixels");
  assert.deepEqual(await sharp(iconBytes).raw().toBuffer(), await sharp(original).resize(192, 192, { fit: "contain" }).raw().toBuffer(), "Search favicon must match the original emblem pixels");
  const unavailableGame = await get("/community/invalid.game.id");
  assert.equal(unavailableGame.status, 404, "Unavailable game pages must return a real 404");
  const missing = await get("/this-page-does-not-exist");
  assert.equal(missing.status, 404, "Unknown pages must return HTTP 404");
  const missingHtml = await missing.text();
  assert(missingHtml.includes("noindex"), "404 page must not be indexed");
  assert(!missingHtml.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), "404 must never load advertising");
  const accountRoutes = ["/login", "/signup", "/forgot-password", "/auth/action", "/dashboard", "/dashboard/games", "/dashboard/publish", "/dashboard/friends", "/dashboard/settings", "/u/sample_player"];
  for (const route of accountRoutes) {
    const response = await get(route);
    assert.equal(response.status, 200, route + " must be reachable");
    const html = await response.text();
    assert(attribute(html, "meta", "name", "robots")?.includes("noindex"), route + " must not be indexed");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = attribute(html, "meta", "name", "description");
    assert(title && !titles.has(title), route + " needs its own title");
    assert(description && !descriptions.has(description), route + " needs its own description");
    titles.add(title);
    descriptions.add(description);
    assert(!html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), route + " must not load advertising");
    assert(!locations.includes(route), route + " must stay out of the public sitemap");
    const gamePopupRoute = ["/login", "/signup", "/forgot-password"].includes(route);
    assert.equal(response.headers.get("cross-origin-opener-policy"), gamePopupRoute ? "unsafe-none" : "same-origin-allow-popups", "Sign-in must preserve the studio opener while supporting provider popups");
    if (route === "/auth/action") {
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.equal(attribute(html, "meta", "name", "referrer"), "no-referrer", "Email action codes must not leak through referrers");
    }
  }
  for (const id of ["sun", "moon", "tiger", "frog", "kite", "planet"]) {
    const response = await get(`/avatars/${id}.svg`);
    assert.equal(response.status, 200, "Missing avatar: " + id);
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert.equal(metadata.width, metadata.height, "Avatars must retain a square aspect ratio");
  }
  console.log(`PASS: ${routes.length} public routes, ${accountRoutes.length} ad-free/noindex account routes, six avatar assets, SEO metadata, structured data, internal links/assets, nine-card hero and noindex preview, responsive AVIF/WebP hero formats/cache/128 KiB aggregate image budget, ${homeCssBytes} bytes of homepage CSS, robots, image gallery and completed-page sitemap, game links, contact, headers, ad-free 404s, FAQ parity, original-logo favicon, approval/consent/preview gates, guide-only ads, privacy disclosures, ads.txt and llms.txt.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill();
    await Promise.race([stopped, delay(5000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill("SIGKILL");
  }
}
