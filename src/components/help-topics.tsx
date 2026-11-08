"use client";
import { useState } from "react";
import Link from "@/components/site-link";
import { ArrowUpRight, Search } from "lucide-react";
import { helpArticles } from "@/lib/help";

export function HelpTopics() {
  const [search, setSearch] = useState("");
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const articles = helpArticles.filter((article) => terms.every((term) => `${article.title} ${article.description} ${article.category} ${article.sections.map((section) => section.title).join(" ")}`.toLowerCase().includes(term)));
  return <section className="help-topics" aria-labelledby="help-topics-title"><div className="help-topics-heading"><div><p className="eyebrow">Players · Creators · Studios</p><h2 id="help-topics-title">Find your next step.</h2></div><label className="help-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search help topics</span><input type="search" placeholder="Try login, publish, saves…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div><p className="help-search-status" role="status">{articles.length} step-by-step guides</p>{["Players", "Creators", "Developers", "Support"].map((category) => { const group = articles.filter((article) => article.category === category); return group.length ? <section key={category} className="help-topic-group"><h3>{category}</h3><div className="help-topic-grid">{group.map((article) => <Link key={article.slug} className="help-topic-card" href={`/help/${article.slug}`}><span><strong>{article.title}</strong><ArrowUpRight size={19} aria-hidden="true" /></span><p>{article.description}</p><small>{article.sections.length} sections · Read guide</small></Link>)}</div></section> : null; })}{!articles.length && <p>No topics match. Try a shorter term, or <Link href="/contact">contact support</Link>.</p>}</section>;
}
