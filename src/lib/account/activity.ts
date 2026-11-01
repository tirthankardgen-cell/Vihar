import type { GameStats } from "./model";

const DAY = 86_400_000;
export type ActivityRange = 90 | 365;
export type PlayActivityDay = { date: string; count: number };

/** Read only daily totals. Aggregate sessions/lastPlayedAt cannot reconstruct a calendar. */
export function buildPlayActivity(stats: GameStats[], endDate: string, range: ActivityRange) {
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(end) || new Date(end).toISOString().slice(0, 10) !== endDate) throw new RangeError("Invalid activity end date.");
  const start = end - (range - 1) * DAY;
  const totals = new Map<string, number>();
  let hasDailyData = false;

  for (const game of stats) {
    if (!game.dailySessions || typeof game.dailySessions !== "object" || Array.isArray(game.dailySessions)) continue;
    for (const [date, count] of Object.entries(game.dailySessions)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isSafeInteger(count) || count < 0) continue;
      const time = Date.parse(`${date}T00:00:00Z`);
      if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date || time < start || time > end) continue;
      const total = (totals.get(date) || 0) + count;
      if (!Number.isSafeInteger(total)) continue;
      hasDailyData = true;
      totals.set(date, total);
    }
  }

  const days: PlayActivityDay[] = Array.from({ length: range }, (_, index) => {
    const date = new Date(start + index * DAY).toISOString().slice(0, 10);
    return { date, count: totals.get(date) || 0 };
  });
  return { days, hasDailyData };
}
