import { FriendsDashboard } from "@/components/account/friends";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata("Your friends", "Find friends by their unique Vihar username, accept requests and share your profile.", "/dashboard/friends");
export default function FriendsPage() { return <FriendsDashboard />; }
