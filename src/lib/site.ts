import type { Metadata } from "next";

function httpsUrl(value: string, name: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${name} must be a public HTTPS URL without credentials.`);
  }
  return url.toString().replace(/\/$/, "");
}

export const site = {
  name: "Vihar",
  tagline: "A space to play.",
  url: httpsUrl(process.env.SITE_URL || "https://www.vihar.online", "SITE_URL"),
  email: process.env.SUPPORT_EMAIL || "contact@vihar.online",
  description:
    "Play original browser games on Vihar. Explore Mumbai in Bap Ka Rasta, an auto-rickshaw driving game, with no account or download needed.",
  gameUrl: httpsUrl(
    process.env.BAP_KA_RASTA_URL || "https://rasta.vihar.online",
    "BAP_KA_RASTA_URL",
  ),
};

const canonical = new URL(site.url);
if (canonical.pathname !== "/" || canonical.search || canonical.hash) {
  throw new Error("SITE_URL must be an HTTPS origin, without a path, query, or fragment.");
}

export const isPreview = process.env.VERCEL_ENV === "preview";
export const publicRoutes = [
  "/", "/games", "/games/bap-ka-rasta", "/games/ekka-chor",
  "/about", "/help", "/contact", "/privacy", "/terms",
] as const;

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) {
  throw new Error("SUPPORT_EMAIL must be a valid email address.");
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = "/images/social-vihar.png",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      url: path,
      title: `${title} | Vihar`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — Vihar` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vihar`,
      description,
      images: [image],
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
