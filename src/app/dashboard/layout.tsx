import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";
import "../account.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <AccountShell>{children}</AccountShell>; }
