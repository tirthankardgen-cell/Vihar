import { jsonLd, site } from "@/lib/site";

export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}

export function BreadcrumbData({ items }: { items: { name: string; path: string }[] }) {
  return <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${site.url}${item.path}` })) }} />;
}
