"use client";

import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import type { GalleryCategory, GalleryImage } from "@/lib/game-showcase";

const categories: { id: "all" | GalleryCategory; label: string }[] = [
  { id: "all", label: "All images" }, { id: "gameplay", label: "Gameplay" },
  { id: "world", label: "Cities & world" }, { id: "rides", label: "Rides" },
  { id: "characters", label: "Characters" },
];

export function GameGallery({ items, compact = false, preloadFirst = false }: { items: readonly GalleryImage[]; compact?: boolean; preloadFirst?: boolean }) {
  const [category, setCategory] = useState<"all" | GalleryCategory>("all");
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const captionId = useId();
  const visible = category === "all" ? items : items.filter((item) => item.category === category);
  const selectedIndex = selected ? visible.findIndex((item) => item.slug === selected.slug) : -1;
  const isOpen = selected !== null;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, [isOpen]);

  function openImage(event: MouseEvent<HTMLAnchorElement>, item: GalleryImage) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!dialog.current?.showModal) return;
    event.preventDefault();
    setSelected(item);
    dialog.current.showModal();
  }
  function move(direction: number) {
    if (!visible.length) return;
    setSelected(visible[(selectedIndex + direction + visible.length) % visible.length]);
  }

  return <div className={`bkr-media ${compact ? "bkr-media-compact" : ""}`}>
    {!compact && <div className="bkr-gallery-toolbar">
      <div className="bkr-gallery-filters" role="group" aria-label="Filter game images">{categories.map((item) => <button type="button" key={item.id} aria-pressed={item.id === category} onClick={() => setCategory(item.id)}>{item.label}<span>{item.id === "all" ? items.length : items.filter((image) => image.category === item.id).length}</span></button>)}</div>
      <p className="bkr-gallery-count" role="status">{visible.length} images · Click to enlarge</p>
    </div>}
    <div className={`bkr-gallery-grid ${compact ? "bkr-gallery-collage" : ""}`}>
      {visible.map((item, index) => <a key={item.slug} id={compact ? undefined : item.slug} className={`bkr-gallery-card bkr-gallery-${item.category}`} href={item.src} aria-label={`View ${item.title}, ${item.kind.toLowerCase()}`} onClick={(event) => openImage(event, item)}>
        <div className="bkr-gallery-image"><Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes={compact ? "(max-width: 767px) 100vw, 55vw" : "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"} preload={preloadFirst && index === 0} /><span className="bkr-image-kind">{item.kind}</span><span className="bkr-image-expand"><Expand size={16} aria-hidden="true" /></span></div>
        <div className="bkr-gallery-caption">{compact ? <h3>{item.title}</h3> : <h2>{item.title}</h2>}<ArrowUpRight size={17} aria-hidden="true" /></div>
      </a>)}
    </div>
    <dialog className="bkr-lightbox" ref={dialog} aria-labelledby={titleId} aria-describedby={captionId} onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}>
      <div className="bkr-lightbox-content">
        <div className="bkr-lightbox-heading"><div><p>{selected?.kind}</p><h2 id={titleId}>{selected?.title ?? "Game image"}</h2></div><button type="button" className="bkr-icon-button" aria-label="Close image viewer" onClick={() => dialog.current?.close()}><X size={23} aria-hidden="true" /></button></div>
        {selected && <div className="bkr-lightbox-image"><Image key={selected.slug} src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} sizes="90vw" /></div>}
        <p id={captionId} className="bkr-lightbox-caption">{selected?.caption}</p>
        <div className="bkr-lightbox-navigation"><button type="button" className="bkr-icon-button" aria-label="Previous image" onClick={() => move(-1)}><ChevronLeft size={22} aria-hidden="true" /></button><span aria-live="polite" aria-atomic="true">{selectedIndex + 1} / {visible.length}</span><button type="button" className="bkr-icon-button" aria-label="Next image" onClick={() => move(1)}><ChevronRight size={22} aria-hidden="true" /></button>{selected && <a href={selected.src} target="_blank" rel="noopener noreferrer">Full-size image <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only">, opens in a new tab</span></a>}</div>
      </div>
    </dialog>
  </div>;
}
