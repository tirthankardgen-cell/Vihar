"use client";

import { usePathname } from "next/navigation";

// The identity provider is a task window, not a page in the discovery site.
// Pass the site chrome as slots so its server components stay on the server.
export function SiteFrame({ children, header, footer }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode }) {
  const identityWindow = usePathname() === "/auth/connect";
  return <>
    {!identityWindow && header}
    <main id="main-content" tabIndex={-1}>{children}</main>
    {!identityWindow && footer}
  </>;
}
