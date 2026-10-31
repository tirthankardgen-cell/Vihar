import { isPreview } from "@/lib/site";

const publisherId = (process.env.ADSENSE_PUBLISHER_ID ?? "ca-pub-6693217545827146").trim();
if (publisherId && !/^ca-pub-\d{16}$/.test(publisherId)) {
  throw new Error("ADSENSE_PUBLISHER_ID must be ca-pub- followed by 16 digits.");
}
const requested = (process.env.ADSENSE_ENABLED ?? "true") === "true";
if (requested && !publisherId) throw new Error("AdSense requires ADSENSE_PUBLISHER_ID.");
export const adsense = { publisherId, enabled: requested && !isPreview };
