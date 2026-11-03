import { PublishGame } from "@/components/community-games";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata("Creator studio", "Share your self-hosted game and track player launches and reviews.", "/dashboard/publish");
export default function PublishPage() { return <PublishGame />; }
