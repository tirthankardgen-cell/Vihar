import { Suspense } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { AccountLoading } from "@/components/account/account-shell";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("Sign in to Vihar ID", "Your own space for games, friends and little adventures. Sign in with Google or email.", "/login");
export default function LoginPage() { return <Suspense fallback={<AccountLoading title="Welcome back." />}><AuthForm mode="login" /></Suspense>; }
