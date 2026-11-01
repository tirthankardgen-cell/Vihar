import { Dashboard } from "@/components/account/dashboard";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata("Your dashboard", "Your Vihar ID, games, stats and friends in one little space.", "/dashboard");
export default function DashboardPage() { return <Dashboard />; }
