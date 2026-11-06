import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Keep page-specific styles separate from the shared site shell.
    cssChunking: { type: "graph", requestCost: 2000 },
  },
  outputFileTracingIncludes: {
    "/u/*/card": ["./public/avatars/*.svg", "./public/brand/vihar-emblem-inverse.svg"],
  },
  async redirects() {
    return [
      // Vercel connects the apex directly to Production; www redirects to it.
      // SITE_URL controls metadata and this redirect together to avoid split canonicals.
      ...(new URL(process.env.SITE_URL || "https://vihar.online").origin === "https://vihar.online" ? [{
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.vihar.online" }],
        destination: "https://vihar.online/:path*",
        permanent: true,
      }] : []),
      { source: "/games/ekka-chor", destination: "/games/gulam-chor", permanent: true },
      { source: "/images/ekka-chor.webp", destination: "/images/gulam-chor.webp", permanent: true },
      { source: "/images/social-ekka-chor.png", destination: "/images/social-gulam-chor.png", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
      {
        source: "/auth/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
