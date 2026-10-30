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
  url: httpsUrl(process.env.SITE_URL || "https://vihar.online", "SITE_URL"),
  email: process.env.SUPPORT_EMAIL || "contact@vihar.online",
  description:
    "Discover original browser games from Vihar. Explore different worlds, take a little break, and find your next space to play.",
  gameUrl: httpsUrl(
    process.env.BAP_KA_RASTA_URL || "https://bap-ka-rasta.vercel.app",
    "BAP_KA_RASTA_URL",
  ),
};

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
