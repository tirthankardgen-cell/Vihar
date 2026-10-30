import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StructuredData } from "@/components/structured-data";
import { site } from "@/lib/site";
import "./globals.css";

const dmSans = localFont({
  src: "../../public/fonts/dm-sans-latin.woff2",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "100 1000",
});

const newsreader = localFont({
  src: [
    { path: "../../public/fonts/newsreader-latin.woff2", style: "normal", weight: "200 800" },
    { path: "../../public/fonts/newsreader-latin-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Vihar — A space to play.", template: "%s | Vihar" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  category: "games",
  referrer: "strict-origin-when-cross-origin",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "en_IN", url: "/", siteName: site.name,
    title: "Vihar — A space to play.", description: site.description,
    images: [{ url: "/images/social-vihar.png", width: 1200, height: 630, alt: "Vihar — A space to play. Original games, different worlds." }],
  },
  twitter: { card: "summary_large_image", title: "Vihar — A space to play.", description: site.description, images: ["/images/social-vihar.png"] },
  icons: { icon: [{ url: "/favicon.ico", sizes: "16x16 32x32 48x48" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
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
