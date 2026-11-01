"use client";
import Link from "@/components/site-link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

export function AccountLink({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { user, profile } = useAuth();
  return <Link href={user ? "/dashboard" : "/login"} onClick={onClick} className={mobile ? "" : "button button-dark header-cta"}>
    <UserRound size={16} aria-hidden="true" />{user ? profile ? "My dashboard" : "Set up Vihar ID" : "Vihar ID"}<ArrowUpRight size={16} aria-hidden="true" />
  </Link>;
}
