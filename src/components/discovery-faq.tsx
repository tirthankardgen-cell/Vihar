import Link from "@/components/site-link";
import { ArrowUpRight } from "lucide-react";
import { discoveryFaqs } from "@/lib/faqs";
import { site } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";

export function DiscoveryFaq({ featured = false }: { featured?: boolean }) {
  return <section id="faqs" className={featured ? "homepage-faq" : "help-group viewport-section"} aria-labelledby="faq-title">
    <div className="faq-intro">
      {featured && <p className="eyebrow">A few answers before you play</p>}
      <h2 id="faq-title">Frequently asked questions</h2>
      {featured && <><p>New to Vihar? Start here. Find answers about our browser games, downloads, and what’s available to play.</p><Link href="/help" className="text-link">All FAQs &amp; game support <ArrowUpRight size={18} aria-hidden="true" /></Link></>}
    </div>
    <div className="faq-list">{discoveryFaqs.map(({ question, answer }, index) => <details className="faq" key={question} open={featured && index === 0}><summary>{question}</summary><div className="faq-answer"><p>{answer}</p></div></details>)}</div>
    {/* Keep repeated FAQ structured data on one authoritative page. */}
    {!featured && <StructuredData data={{ "@context": "https://schema.org", "@type": "FAQPage", "@id": `${site.url}/help#faqs`, mainEntity: discoveryFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />}
  </section>;
}
