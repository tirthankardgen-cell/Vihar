import { adsense } from "@/lib/adsense";
import { isPreview } from "@/lib/site";

export const dynamic = "force-static";
export function GET() {
  const content = adsense.publisherId && !isPreview
    ? `google.com, ${adsense.publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
    : "# AdSense publisher is not configured for this deployment.\n";
  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
