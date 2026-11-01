import assert from "node:assert/strict";
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
const canonical = new URL(process.env.SITE_URL || "https://www.vihar.online");
const gameUrl = process.env.BAP_KA_RASTA_URL || "https://rasta.vihar.online";
const email = process.env.SUPPORT_EMAIL || "contact@vihar.online";
const preview = process.env.VERCEL_ENV === "preview";
const guidePath = "/guides/bap-ka-rasta-first-drive";
const galleryPath = "/games/bap-ka-rasta/screenshots";
const routes = ["/", "/games", "/games/bap-ka-rasta", "/games/gulam-chor", "/about", "/help", "/contact", "/privacy", "/terms", guidePath, galleryPath];
const indexableRoutes = routes.filter((route) => route !== "/games/gulam-chor");
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
  for (const asset of shareImages) {
    const response = await get(asset);
    assert.equal(response.status, 200, "Missing sharing image: " + asset);
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert.equal(metadata.width, 1200, asset + " width");
    assert.equal(metadata.height, 630, asset + " height");
  }
  // Guard the first-load budgets and verify every negotiated hero format.
  const home = pages.get("/");
  const heroPicture = home.match(/<picture>([\s\S]*?)<\/picture>/)?.[1];
  assert(heroPicture, "Homepage needs responsive hero artwork");
  const heroSources = [...heroPicture.matchAll(/\bsrcSet="([^"]+)"/gi)].flatMap((match) => decode(match[1]).split(",").map((candidate) => candidate.trim().split(/\s+/)));
  assert.equal(heroSources.length, 6, "Hero needs three sizes in AVIF and WebP");
  for (const [url, descriptor] of heroSources) {
    const response = await get(url);
    assert.equal(response.status, 200, "Missing hero asset: " + url);
    assert(response.headers.get("cache-control")?.includes("immutable"), "Hashed hero assets must be immutable");
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    assert.equal(metadata.width, Number.parseInt(descriptor), "Hero srcset must describe its actual width");
    assert.equal(metadata.height, metadata.width, "Hero artwork must retain its square aspect ratio");
    assert.equal(response.headers.get("content-type"), url.endsWith(".avif") ? "image/avif" : "image/webp");
    if (url.endsWith(".avif") && descriptor === "768w") assert(buffer.length <= 25 * 1024, "Mobile hero must stay within 25 KiB");
  }
  const homeStylesheets = [...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => decode(match[1]));
  let homeCssBytes = 0;
  for (const url of new Set(homeStylesheets)) {
    const response = await get(url);
    assert.equal(response.status, 200, "Missing homepage stylesheet: " + url);
    homeCssBytes += (await response.arrayBuffer()).byteLength;
  }
  assert(homeCssBytes > 0 && homeCssBytes <= 32 * 1024, "Homepage CSS must stay within 32 KiB uncompressed");
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
  if (!preview) assert(robots.includes(new URL("/sitemap.xml", canonical).href));
  const sitemap = await (await get("/sitemap.xml")).text();
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  assert.deepEqual([...locations].sort(), [...indexableRoutes].sort(), "Sitemap must contain completed pages, excluding the upcoming announcement");
  assert(sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), "Image sitemap namespace");
  const imageLocations = [...sitemap.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((match) => new URL(decode(match[1])));
  assert(imageLocations.length >= 10, "Relevant pages need image sitemap entries");
  for (const url of new Map(imageLocations.map((url) => [url.href, url])).values()) {
    assert.equal(url.origin, canonical.origin, "Images must use the canonical origin");
    const response = await get(url.pathname);
    assert.equal(response.status, 200, "Missing sitemap image: " + url.pathname);
    const info = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert(info.width > 0 && info.height > 0, "Sitemap image must decode");
  }
  const gallery = pages.get(galleryPath);
  const gallerySchema = [...gallery.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((data) => data["@type"] === "ImageGallery");
  assert.equal(gallerySchema?.image.length, 27, "Gallery must describe gameplay, map, cities, rides, characters and world renders");
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
  assert(!pages.get("/games/gulam-chor").includes('href="' + gameUrl + '"'), "Upcoming game must not have a launch link");
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
  assert(faq && faq.mainEntity.length === 4, "Visible discovery FAQ schema");
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
  const missing = await get("/this-page-does-not-exist");
  assert.equal(missing.status, 404, "Unknown pages must return HTTP 404");
  const missingHtml = await missing.text();
  assert(missingHtml.includes("noindex"), "404 page must not be indexed");
  assert(!missingHtml.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), "404 must never load advertising");
  console.log(`PASS: ${routes.length} public routes, SEO metadata, structured data, internal links/assets, responsive hero formats/cache/byte budget, homepage CSS budget, robots, image gallery and completed-page sitemap, game links, contact, headers, ad-free 404s, FAQ parity, original-logo favicon, approval/consent/preview gates, guide-only ads, privacy disclosures, ads.txt and llms.txt.`);
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
