export const gameCategories = [
  { id: "board-table", label: "Board & Table" },
  { id: "puzzles", label: "Puzzles & Quick Play" },
  { id: "cards", label: "Cards" },
  { id: "arcade", label: "Arcade" },
  { id: "free-roam", label: "Free roam" },
  { id: "teamwork", label: "Teamwork" },
  { id: "simulation", label: "Simulation" },
  { id: "solo", label: "Solo" },
] as const;

export type GameCategory = (typeof gameCategories)[number]["id"];
export type CategoryFilter = "all" | GameCategory;

export function categoryLabel(category: GameCategory) {
  return gameCategories.find(({ id }) => id === category)!.label;
}
