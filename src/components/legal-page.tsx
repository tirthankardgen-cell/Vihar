import type { ReactNode } from "react";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData } from "@/components/structured-data";

type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalPage({ title, path, description, summary, sections }: {
  title: string;
  path: string;
  description: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: title }]} />
      <PageIntro eyebrow="The useful details" title={title} description={description} />
      <p className="policy-date">Last updated: <time dateTime="2026-10-30">30 October 2026</time></p>
      <div className="legal-layout">
        <aside className="legal-toc"><p className="eyebrow">On this page</p><nav aria-label={title + " contents"}>{sections.map((section) => <a key={section.id} href={"#" + section.id}>{section.title}</a>)}</nav></aside>
        <div className="legal-copy"><p className="legal-summary">{summary}</p>{sections.map((section) => <section key={section.id} id={section.id} aria-labelledby={section.id + "-title"}><h2 id={section.id + "-title"}>{section.title}</h2>{section.content}</section>)}</div>
      </div>
      <BreadcrumbData items={[{ name: title, path }]} />
    </div>
  );
}
