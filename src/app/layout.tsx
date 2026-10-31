import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StructuredData } from "@/components/structured-data";
import { isPreview, site } from "@/lib/site";
import { adsense } from "@/lib/adsense";
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
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Vihar — Original Browser Games | A space to play.", template: "%s | Vihar" },
  description: site.description,
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  other: adsense.publisherId && !isPreview ? { "google-adsense-account": adsense.publisherId } : {},
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  category: "games",
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  referrer: "strict-origin-when-cross-origin",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "en_IN", url: "/", siteName: site.name,
    title: "Vihar — A space to play.", description: site.description,
    images: [{ url: "/images/social-vihar.png", width: 1200, height: 630, alt: "Vihar — A space to play. Original games, different worlds." }],
  },
  twitter: { card: "summary_large_image", title: "Vihar — A space to play.", description: site.description, images: ["/images/social-vihar.png"] },
  icons: { icon: [{ url: "/favicon.ico", sizes: "16x16 32x32 48x48" }, { url: "/brand/favicon-48.png", type: "image/png", sizes: "48x48" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAF9F6", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${newsreader.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
        <StructuredData data={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${site.url}/#organization`, name: "Vihar", url: site.url, logo: `${site.url}/brand/vihar-avatar.png`, email: site.email }} />
      </body>
    </html>
  );
}
