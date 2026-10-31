type AdSenseEnvironment = Record<string, string | undefined>;

export function getAdSenseConfig(env: AdSenseEnvironment) {
  const publisherId = (env.ADSENSE_PUBLISHER_ID ?? "ca-pub-6693217545827146").trim();
  if (publisherId && !/^ca-pub-\d{16}$/.test(publisherId)) {
    throw new Error("ADSENSE_PUBLISHER_ID must be ca-pub- followed by 16 digits.");
  }
  const requested = env.ADSENSE_ENABLED === "true";
  if (requested && !publisherId) throw new Error("AdSense requires ADSENSE_PUBLISHER_ID.");
  // Deployment confirmations, not a replacement for approval or a certified CMP.
  const approved = env.ADSENSE_SITE_APPROVED === "true";
  const consentReady = env.ADSENSE_CONSENT_READY === "true";
  return { publisherId, enabled: requested && approved && consentReady && env.VERCEL_ENV !== "preview" };
}
