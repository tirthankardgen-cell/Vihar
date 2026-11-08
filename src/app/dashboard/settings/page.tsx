import { GameConnections } from "@/components/account/connected-games";
import { SettingsDashboard } from "@/components/account/settings";
import { pageMetadata, site } from "@/lib/site";
export const metadata = pageMetadata("Account settings", "Edit your Vihar avatar and profile, connect sign-in methods and manage your data.", "/dashboard/settings");
export default function SettingsPage() { return <><SettingsDashboard supportEmail={site.email} /><GameConnections /></>; }
