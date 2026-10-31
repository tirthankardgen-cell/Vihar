"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { isAdContentPath } from "@/lib/ad-content";

// Auto ads mutate the document outside React. Crossing an advertising page
// needs a fresh document so scripts/iframes cannot survive onto an excluded
// page. Other navigation keeps Next.js routing and same-page anchors intact.
export default function SiteLink({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) {
  const pathname = usePathname();
  const targetPath = href.split(/[?#]/)[0];
  const samePage = href.startsWith("#") || targetPath === pathname;
  const internal = href.startsWith("/") && !href.startsWith("//");
  const destination = internal && !samePage ? href.split("#")[0] : href;
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!props.target || props.target === "_self") && samePage && !href.includes("#")) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }
  if (!samePage && (isAdContentPath(pathname) || isAdContentPath(targetPath))) {
    return <a href={destination} onClick={handleClick} {...props} />;
  }
  // Keep route/code downloads behind navigation instead of competing with the
  // current page's hero and fonts on slow connections.
  return <NextLink href={destination} prefetch={false} scroll={samePage} onClick={handleClick} {...props} />;
}
