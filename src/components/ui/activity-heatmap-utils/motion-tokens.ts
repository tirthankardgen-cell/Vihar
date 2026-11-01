export const motionTokens = {
  ease: { enter: [0.16, 1, 0.3, 1], standard: [0.22, 1, 0.36, 1] },
  blur: { soft: 3, subtle: 1.5 },
  duration: { fast: 0.16 },
  spring: {
    snappy: { type: "spring", stiffness: 480, damping: 38, mass: 0.7 },
    morph: { type: "spring", stiffness: 380, damping: 34, mass: 0.8 },
  },
} as const;
