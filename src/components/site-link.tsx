"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { isAdContentPath } from "@/lib/ad-content";

// Auto ads mutate the document outside React. Crossing an advertising page
// needs a fresh document so scripts/iframes cannot survive onto an excluded
// page. Other navigation keeps Next.js routing and same-page anchors intact.
export default function SiteLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  const pathname = usePathname();
  const targetPath = href.split(/[?#]/)[0];
  const samePage = href.startsWith("#") || targetPath === pathname;
  if (!samePage && (isAdContentPath(pathname) || isAdContentPath(targetPath))) {
    return <a href={href} {...props} />;
  }
  return <NextLink href={href} {...props} />;
}
