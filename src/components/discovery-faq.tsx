import { discoveryFaqs } from "@/lib/faqs";
import { site } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";

export function DiscoveryFaq() {
  return <section className="help-group" aria-labelledby="vihar-questions">
    <h2 id="vihar-questions">About Vihar browser games</h2>
    {discoveryFaqs.map(({ question, answer }) => <details className="faq" key={question}><summary>{question}</summary><div className="faq-answer"><p>{answer}</p></div></details>)}
    <StructuredData data={{ "@context": "https://schema.org", "@type": "FAQPage", "@id": `${site.url}/help#vihar-questions`, mainEntity: discoveryFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
  </section>;
}
