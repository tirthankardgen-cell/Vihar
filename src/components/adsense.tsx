import { adsense } from "@/lib/adsense";

export function AdSense() {
  if (!adsense.enabled) return null;
  return <script id="google-adsense" async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`}
    crossOrigin="anonymous" />;
}
