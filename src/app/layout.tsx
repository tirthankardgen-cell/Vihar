import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SiteFrame } from "@/components/site-frame";
import { RouteScrollReset } from "@/components/route-scroll-reset";
import { StructuredData } from "@/components/structured-data";
import { isPreview, site } from "@/lib/site";
import { adsense } from "@/lib/adsense";
import { AuthProvider } from "@/components/account/auth-provider";
import "./globals.css";

const dmSans = localFont({
  src: "../../public/fonts/dm-sans-latin.woff2",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "100 1000",
});

const newsreader = localFont({
  src: [
    { path: "../../public/fonts/newsreader-latin.woff2", style: "normal", weight: "400" },
    { path: "../../public/fonts/newsreader-latin-medium.woff2", style: "normal", weight: "500" },
    { path: "../../public/fonts/newsreader-latin-italic.woff2", style: "italic", weight: "400" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Vihar — Discover, Play & Share Games", template: "%s | Vihar" },
  description: site.description,
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : {},
  },
  other: adsense.publisherId && !isPreview ? { "google-adsense-account": adsense.publisherId } : {},
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  category: "games",
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  referrer: "strict-origin-when-cross-origin",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "en_IN", url: "/", siteName: site.name,
    title: "Vihar — A space to play.", description: site.description,
    images: [{ url: "/images/social-vihar.png", width: 1200, height: 630, alt: "Vihar — A space to play. Games, creators and a community of players." }],
  },
  twitter: { card: "summary_large_image", title: "Vihar — A space to play.", description: site.description, images: ["/images/social-vihar.png"] },
  icons: {
    icon: [
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAF9F6", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${dmSans.variable} ${newsreader.variable}`}>
      <body>
        <AuthProvider>
        <RouteScrollReset />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteFrame header={<Header />} footer={<Footer />}>{children}</SiteFrame>
        </AuthProvider>
        <StructuredData data={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${site.url}/#organization`, name: "Vihar", url: site.url, description: site.description, logo: { "@type": "ImageObject", "@id": `${site.url}/#logo`, url: `${site.url}/brand/vihar-avatar.png`, contentUrl: `${site.url}/brand/vihar-avatar.png`, caption: "Vihar — A space to play" }, email: site.email, sameAs: [site.instagram] }} />
      </body>
    </html>
  );
}
