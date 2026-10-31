import { adsense } from "@/lib/adsense";
import { isAdContentPath } from "@/lib/ad-content";
import { PrivacyChoices } from "@/components/privacy-choices";

export function AdSense({ path }: { path: string }) {
  if (!adsense.enabled || !isAdContentPath(path)) return null;
  // React hoists async scripts into the head. Keep this in the completed page,
  // never the root layout: a 404 or failed render must not inherit advertising.
  return <><PrivacyChoices /><script id="google-adsense" async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`}
    crossOrigin="anonymous" /></>;
}
