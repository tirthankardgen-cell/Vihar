import { Suspense } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { AccountLoading } from "@/components/account/account-shell";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("Create your Vihar ID", "Choose your own Vihar identity, find your people and keep your favourite games close.", "/signup");
export default function SignupPage() { return <Suspense fallback={<AccountLoading title="Make yourself at home." />}><AuthForm mode="signup" /></Suspense>; }
