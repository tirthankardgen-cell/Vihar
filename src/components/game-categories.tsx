import { Compass, Gamepad2, Grid2X2, SlidersHorizontal, Spade, UserRound, UsersRound } from "lucide-react";
import Link from "@/components/site-link";
import { gameCategories, type CategoryFilter } from "@/lib/game-categories";

const icons = {
  all: Grid2X2,
  cards: Spade,
  arcade: Gamepad2,
  "free-roam": Compass,
  teamwork: UsersRound,
  simulation: SlidersHorizontal,
  solo: UserRound,
};

const options = [{ id: "all", label: "All categories" }, ...gameCategories] as const;

export function GameCategories({
  selected = "all",
  onSelect,
  showAll = true,
}: {
  selected?: CategoryFilter;
  onSelect?: (category: CategoryFilter) => void;
  showAll?: boolean;
}) {
  return (
    <div className="game-categories" role={onSelect ? "group" : "navigation"} aria-label="VIHAR Originals categories">
      {options.filter(({ id }) => showAll || id !== "all").map(({ id, label }) => {
        const Icon = icons[id];
        const content = <><Icon size={16} aria-hidden="true" /><span>{label}</span></>;
        return onSelect ? (
          <button type="button" className="category-chip" key={id} aria-pressed={selected === id} onClick={() => onSelect(id)}>{content}</button>
        ) : (
          <Link className="category-chip" key={id} href={id === "all" ? "/games/originals" : `/games/originals?category=${id}`}>{content}</Link>
        );
      })}
    </div>
  );
}
