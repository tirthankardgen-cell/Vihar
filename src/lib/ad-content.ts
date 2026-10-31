// Only completed editorial content belongs here. Never add search, launch,
// support, legal, error, or upcoming-game pages to this list.
export const adContentPaths = ["/guides/bap-ka-rasta-first-drive"] as const;

export function isAdContentPath(path: string): boolean {
  return adContentPaths.some((candidate) => candidate === path.replace(/\/$/, ""));
}
