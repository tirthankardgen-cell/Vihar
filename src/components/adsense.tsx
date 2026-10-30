import Script from "next/script";
import { adsense } from "@/lib/adsense";

export function AdSense() {
  if (!adsense.enabled) return null;
  return <Script id="google-adsense" strategy="afterInteractive" async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`}
    crossOrigin="anonymous" />;
}
