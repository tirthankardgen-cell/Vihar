import { notFound } from "next/navigation";
import Link from "@/components/site-link";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { PageIntro } from "@/components/page-intro";
import { findHelp, helpArticles, helpUpdated } from "@/lib/help";
import { pageMetadata, site } from "@/lib/site";
import "../help.css";

export const dynamicParams = false;
export function generateStaticParams() { return helpArticles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = findHelp((await params).slug);
  if (!article) return {};
  return pageMetadata(article.title, article.description, `/help/${article.slug}`);
}
export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = findHelp((await params).slug);
  if (!article) notFound();
  const path = `/help/${article.slug}`;
  return <div className="container help-article"><nav className="help-breadcrumb" aria-label="Breadcrumb"><Link href="/help">Help &amp; support</Link><span aria-hidden="true">/</span><span>{article.category}</span></nav><PageIntro eyebrow={`${article.category} guide`} title={article.title} description={article.description} /><div className="help-article-layout"><aside className="help-contents"><p className="eyebrow">In this guide</p><nav aria-label="On this page">{article.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav><p>Updated <time dateTime={helpUpdated}>8 November 2026</time></p><Link href="/help/contact-support">Need a hand? Contact support →</Link></aside><article className="help-article-body">{article.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.steps && <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}{section.code && <pre tabIndex={0} aria-label={`${section.title} code example`}><code>{section.code}</code></pre>}{section.links && <ul className="help-resource-links">{section.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label} →</Link></li>)}</ul>}</section>)}<section className="help-related"><h2>Keep going</h2>{article.related.map((slug) => { const related = findHelp(slug); return related ? <Link href={`/help/${slug}`} key={slug}>{related.title} →</Link> : null; })}<Link href="/help">All help topics →</Link></section></article></div><BreadcrumbData items={[{ name: "Help & support", path: "/help" }, { name: article.title, path }]} /><StructuredData data={{ "@context": "https://schema.org", "@type": "TechArticle", headline: article.title, description: article.description, url: site.url + path, mainEntityOfPage: site.url + path, datePublished: helpUpdated, dateModified: helpUpdated, inLanguage: "en", author: { "@type": "Organization", name: "Vihar", url: site.url }, publisher: { "@id": `${site.url}/#organization` }, articleSection: article.category, about: ["Vihar ID", "Community games"], hasPart: article.sections.map((section) => ({ "@type": "WebPageElement", name: section.title, url: `${site.url}${path}#${section.id}` })) }} /></div>;
}
