import { Suspense } from "react";
import { AuthAction } from "@/components/account/auth-action";
import { AccountLoading } from "@/components/account/account-shell";
import { pageMetadata } from "@/lib/site";

export const metadata = { ...pageMetadata("Verify your Vihar ID", "Complete your email verification or reset your account password.", "/auth/action"), referrer: "no-referrer" as const };
export default function ActionPage() { return <Suspense fallback={<AccountLoading title="Checking your link…" />}><AuthAction /></Suspense>; }
