"use client";


import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowUpRight, CirclePause, Play } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, RefObject } from "react";
import type { WorldCard } from "@/lib/hero-games";
import "../quick-play-fonts.css";
import styles from "./perspective-tunnel-hero.module.css";

const SLOT_POSITIONS = Array.from({ length: 12 }, (_, index) => {
  const angle = index * 137.5 * Math.PI / 180;
  return {
    x: Math.cos(angle) * (0.28 + (index % 3) * 0.08),
    y: Math.sin(angle) * (0.26 + (index % 2) * 0.09),
    rotation: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
    index,
  };
});

// Begin inside one image tunnel; scrolling clears it to reveal the copy.
const INITIAL_PHASE = 0.46;
const CAMERA_SPRING = { stiffness: 65, damping: 25, mass: 0.5 };

function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

const readMotionPreference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Match the server's markup during hydration; CSS respects the preference immediately.
const readServerMotionPreference = () => false;

interface StageDimensions {
  isMobile: boolean;
  canPin: boolean;
}

function useCameraParallax(ref: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, CAMERA_SPRING);
  const y = useSpring(rawY, CAMERA_SPRING);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = element.getBoundingClientRect();
      rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
      rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
    };
    const reset = () => { rawX.set(0); rawY.set(0); };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      reset();
    };
  }, [enabled, ref, rawX, rawY]);

  return { x, y };
}

function TunnelCard({ card, progress, pointer }: {
  card: WorldCard & (typeof SLOT_POSITIONS)[number] & { number: number };
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
}) {
  const start = (card.index / SLOT_POSITIONS.length) * 0.45;
  const localProgress = useTransform(progress, [start, start + 0.55], [0, 1]);
  const transform = useTransform([localProgress, pointer.x, pointer.y], (values) => {
    const [travel, px, py] = values as number[];
    return `translate3d(calc(-50% - var(--camera-pan) * ${px}), calc(-50% - var(--camera-pan) * ${py}), calc(var(--far-z) + var(--z-travel) * ${travel})) rotateZ(${card.rotation}deg)`;
  });
  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (value) => value > 0.01 ? "visible" : "hidden");
  const positioning = {
    "--card-x": `${50 + card.x * 100}%`,
    "--card-y": `${50 + card.y * 100}%`,
    "--rest-progress": (INITIAL_PHASE - start) / 0.55,
    "--card-rotation": `${card.rotation}deg`,
    zIndex: card.index + 1,
  } as CSSProperties;

  return (
    <motion.div className={styles.card} style={{ ...card.visual, ...positioning, transform, opacity, visibility }} data-world-card={card.number}>
      <Link href={card.href} className={styles.cardLink}>
        <Image src={card.src} alt={card.alt} fill sizes="(max-width: 767px) 180px, (max-width: 1100px) 240px, 320px" loading={card.index < 2 ? "eager" : "lazy"} draggable={false} className={styles.cardImage} />
        <span className={styles.cardNumber} aria-hidden="true">{String(card.number + 1).padStart(2, "0")}</span>
        <span className={styles.cardArrow} aria-hidden="true"><ArrowUpRight size={16} /></span>
        <span className={styles.cardCaption}><span>{card.href.startsWith("/games/") ? `VIHAR Original · ${card.caption}` : card.caption}</span><strong>{card.title}</strong></span>
      </Link>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({ worldCards }: { worldCards: WorldCard[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useSyncExternalStore(subscribeToMotionPreference, readMotionPreference, readServerMotionPreference);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState<StageDimensions>({ isMobile: false, canPin: true });
  const motionEnabled = !reduce && !paused;

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    // Observe this stage, rather than assuming it has the window's dimensions.
    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setStage({ isMobile: width < 768, canPin: element.getBoundingClientRect().height <= window.innerHeight + 1 });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Native document scrolling advances the tunnel and continues into the games.
  // No wheel interception: touch, keyboard and same-page links work normally.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: stage.canPin && motionEnabled ? ["start start", "end end"] : ["start start", "end start"],
  });
  // Clear every card before the pinned stage releases, leaving the copy visible.
  const progress = useTransform(scrollYProgress, (value) => motionEnabled ? INITIAL_PHASE + Math.min(1, Math.max(0, value / 0.9)) * (1 - INITIAL_PHASE) : INITIAL_PHASE);
  const pointer = useCameraParallax(stageRef, motionEnabled && !stage.isMobile);

  return (
    <section ref={containerRef} className={styles.hero} aria-labelledby="vihar-world-title" data-motion={motionEnabled ? "on" : "off"} data-pinned={stage.canPin}>
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.atmosphere} aria-hidden="true" />
        <div className={styles.dots} aria-hidden="true" />
        <div className={styles.rings} aria-hidden="true"><span /><span /><span /></div>

        <div className={styles.topline}>
          <span className={styles.toplineLabel}><span className={styles.statusDot} aria-hidden="true" /> A space to play</span>
          <div className={styles.toplineTools}>
            <button type="button" className={styles.motionToggle} onClick={() => setPaused((value) => !value)} aria-label={reduce ? "Reduced motion" : motionEnabled ? "Pause motion" : "Resume motion"} title={reduce ? "Your device has requested reduced motion." : motionEnabled ? "Pause motion" : "Resume motion"} disabled={reduce}>
              {motionEnabled ? <CirclePause size={16} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={styles.copy}>
          <div className={styles.anchor}>
            <p className={styles.eyebrow}>A home for games. A community of creators.</p>
            <h1 id="vihar-world-title" className={styles.title}>
              <span className={styles.titleIntro}>Into the </span>
              <span className={styles.titleName}>Vihar </span>
              <span className={styles.titleWorld}>world.</span>
            </h1>
            <p className={styles.description}>Discover games. Meet their creators.<br />Play, leave a review, and share your own world.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/games" className={styles.enterButton}>Discover games <ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link href="/dashboard/publish" className={styles.playButton}>Share your game <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className={styles.scene}>
          {worldCards.map((card, index) => <TunnelCard key={card.src} card={{ ...card, ...SLOT_POSITIONS[index], number: index }} progress={progress} pointer={pointer} />)}
        </div>
      </div>
    </section>
  );
}
