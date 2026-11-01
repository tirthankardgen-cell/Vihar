import { Suspense } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { AccountLoading } from "@/components/account/account-shell";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("Reset your password", "Get a secure email link to reset your Vihar ID password.", "/forgot-password");
export default function PasswordPage() { return <Suspense fallback={<AccountLoading title="A fresh start." />}><AuthForm mode="reset" /></Suspense>; }
