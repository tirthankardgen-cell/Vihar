"use client";

import "@/app/discovery-highlights.css";

import { useEffect, useRef, useState } from "react";
import { average, collection, count, getAggregateFromServer, onSnapshot, query, where } from "firebase/firestore";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Star, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site-link";
import { CommunityCreator } from "./community-creator";
import { GameOrigin } from "./game-origin";
import { GameArtwork } from "./game-editor";
import { RatingBadge } from "./rating-badge";
import { getFirebase } from "@/lib/firebase/client";
import { rankCommunityGames, recommendedGames, recommendationKey, type Recommendation, type RatingSummary } from "@/lib/community-ranking";
import type { CommunityGame } from "@/lib/community";
import type { Game } from "@/lib/games";

export function CommunityHighlights({ initialGames, originals, recommendations = false }: { initialGames: CommunityGame[]; originals: Game[]; recommendations?: boolean }) {
  const [games, setGames] = useState(initialGames);
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const shelf = useRef<HTMLDivElement>(null);
  const rankingShelf = useRef<HTMLOListElement>(null);
  const [edges, setEdges] = useState({ rankStart: true, rankEnd: true, pickStart: true, pickEnd: true });
  useEffect(() => {
    let active = true;
    let generation = 0;
    try {
      const { db } = getFirebase();
      const stop = onSnapshot(query(collection(db, "communityGames"), where("published", "==", true)), (snapshot) => {
        const current = ++generation;
        const published = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as CommunityGame);
        setGames(published);
        setStatus("loading");
        void Promise.all([...published.map(async (game) => {
          const result = await getAggregateFromServer(collection(db, "communityGames", game.id, "reviews"), { rating: average("rating"), count: count() });
          return [game.id, result.data()] as const;
        }), ...originals.filter((game) => game.status === "playable").map(async (game) => {
          const key = `officialGames/${game.slug}`;
          try {
            const result = await getAggregateFromServer(collection(db, "officialGames", game.slug, "reviews"), { rating: average("rating"), count: count() });
            return [key, result.data()] as const;
          } catch { return [key, { rating: null, count: 0 }] as const; }
        })]).then((entries) => { if (active && current === generation) { setRatings(Object.fromEntries(entries)); setStatus("ready"); } }).catch(() => { if (active && current === generation) setStatus("error"); });
      }, () => setStatus("error"));
      return () => { active = false; stop(); };
    } catch { queueMicrotask(() => { if (active) setStatus("error"); }); }
    return () => { active = false; };
  }, [attempt, originals]);
  const ranked = rankCommunityGames(games, ratings);
  const picks = recommendedGames(originals, games, ratings);
  function updateEdges() {
    const rank = rankingShelf.current;
    const pick = shelf.current;
    const next = { rankStart: !rank || rank.scrollLeft <= 2, rankEnd: !rank || rank.scrollLeft + rank.clientWidth >= rank.scrollWidth - 2, pickStart: !pick || pick.scrollLeft <= 2, pickEnd: !pick || pick.scrollLeft + pick.clientWidth >= pick.scrollWidth - 2 };
    setEdges((previous) => Object.keys(next).every((key) => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
  }
  useEffect(() => {
    const observer = new ResizeObserver(updateEdges);
    if (rankingShelf.current) observer.observe(rankingShelf.current);
    if (shelf.current) observer.observe(shelf.current);
    return () => observer.disconnect();
  }, [ranked.length, picks.length]);
  function scrollShelf(direction: number, ranking = false) {
    const element = ranking ? rankingShelf.current : shelf.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * .85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <>
    {(ranked.length > 0 || status === "error" || (status === "loading" && games.length > 0)) && <section className="community-ranking" aria-labelledby="ranking-title">
      <div className="discovery-section-heading"><div><p className="eyebrow"><Trophy size={15} aria-hidden="true" /> The player picks</p><h2 id="ranking-title">Top 5 <em>Community Games.</em></h2></div><Link className="text-link" href="/games/community">Explore community <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      <p className="ranking-method">Ranked by player rating, then number of reviews. Published community games only.</p>
      {status === "error" ? <div className="ranking-empty"><Trophy size={28} aria-hidden="true" /><h3>Rankings are taking a break.</h3><p>We couldn’t load player ratings. You can still explore the collections.</p><button className="text-link" type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>Try again <ArrowRight size={15} aria-hidden="true" /></button></div>
        : status === "loading" && games.length > 0 ? <p className="ranking-loading" role="status">Gathering player ratings…</p>
        : ranked.length ? <div className="ranking-carousel">
          <ol className="ranking-shelf" ref={rankingShelf} onScroll={updateEdges} tabIndex={0} aria-label="Top five community games; scroll horizontally for more">{ranked.map((game, index) => <li className="rank-card" key={game.id}>
            <span className="rank-number" aria-label={`Rank ${index + 1}`}>{index + 1}</span>
            <div className="rank-content"><Link className="rank-art" href={`/community/${game.id}`} aria-label={`Rank ${index + 1}: ${game.title}`}><GameArtwork src={game.coverUrl} title={game.title} /><span className="rank-origin"><GameOrigin source="communityGames" /></span><span className="rank-play">Explore game <ArrowUpRight size={17} aria-hidden="true" /></span></Link>
              <div className="rank-caption"><h3><Link href={`/community/${game.id}`}>{game.title}</Link></h3><span className="rank-rating" aria-label={`${ratings[game.id].rating!.toFixed(1)} out of 5 from ${ratings[game.id].count} reviews`}><Star size={13} fill="currentColor" aria-hidden="true" />{ratings[game.id].rating!.toFixed(1)} <small>({ratings[game.id].count})</small></span></div>
              <CommunityCreator ownerId={game.ownerId} />
            </div>
          </li>)}</ol>
          <div className="shelf-controls ranking-controls"><button type="button" aria-label="Previous ranked games" disabled={edges.rankStart} onClick={() => scrollShelf(-1, true)}><ChevronLeft size={20} /></button><button type="button" aria-label="Next ranked games" disabled={edges.rankEnd} onClick={() => scrollShelf(1, true)}><ChevronRight size={20} /></button></div>
        </div> : null}
    </section>}

    {recommendations && <section className="recommendation-section" aria-labelledby="recommendation-title">
      <div className="discovery-section-heading"><div><p className="eyebrow">Recommended games</p><h2 id="recommendation-title">Worth <em>a play.</em></h2><p className="recommendation-description">VIHAR Originals and community discoveries, ordered by player ratings. Unrated games follow.</p></div><div className="shelf-controls"><button type="button" aria-label="Previous recommended games" disabled={edges.pickStart} onClick={() => scrollShelf(-1)}><ChevronLeft size={19} /></button><button type="button" aria-label="Next recommended games" disabled={edges.pickEnd} onClick={() => scrollShelf(1)}><ChevronRight size={19} /></button></div></div>
      <div className="recommendation-shelf" ref={shelf} onScroll={updateEdges} tabIndex={0} role="region" aria-label="Recommended games; scroll horizontally for more">
        {picks.map((item, index) => <RecommendationCard eager={index === 0 && ranked.length === 0} key={`${item.source}:${recommendationKey(item)}`} item={item} />)}
      </div>
    </section>}
  </>;
}

function RecommendationCard({ item, eager }: { item: Recommendation; eager: boolean }) {
  const official = item.source === "officialGames";
  const game = item.game;
  const path = item.source === "officialGames" ? `/games/${item.game.slug}` : `/community/${item.game.id}`;
  return <article className="recommendation-card"><Link className="recommendation-art" href={path}>
    {item.source === "officialGames" ? <><Image src={item.game.artwork} alt={item.game.artworkAlt} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) 85vw, (max-width: 1000px) 45vw, 520px" /><span className="recommendation-image-label">{item.game.artworkLabel}</span></> : <GameArtwork src={item.game.coverUrl} title={game.title} />}
    <span className="recommendation-origin"><GameOrigin source={item.source} /></span>
    <div className="recommendation-title"><span>{game.genre || "Independent game"} · {item.source === "officialGames" ? item.game.platform : item.game.kind === "browser" ? "Browser" : "Download"}</span><h3>{game.title}</h3><span className="recommendation-play">{official ? "Meet the game" : "Play & reviews"} <ArrowUpRight size={17} aria-hidden="true" /></span></div>
    <RatingBadge id={item.source === "officialGames" ? item.game.slug : item.game.id} source={item.source} upcoming={item.source === "officialGames" && item.game.status !== "playable"} />
  </Link><div className="recommendation-meta">{item.source === "officialGames" ? <><span>Created by <strong>VIHAR</strong></span><span className="recommendation-status">{item.game.status === "playable" ? "Playable now" : "Coming soon"}</span></> : <CommunityCreator ownerId={item.game.ownerId} />}</div></article>;
}
