"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import { buildPlayActivity, type ActivityRange } from "@/lib/account/activity";
import { useAccountData } from "./account-shell";

export function PlayActivity() {
  const { stats, loading, error } = useAccountData();
  const [range, setRange] = useState<ActivityRange>(365);
  const [selected, setSelected] = useState<string | null>(null);
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const refresh = () => setToday(new Date().toISOString().slice(0, 10));
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const { days, hasDailyData } = useMemo(() => buildPlayActivity(stats, today, range), [stats, today, range]);
  const chosen = days.find((day) => day.date === selected);
  const period = range === 365 ? "the last year" : "the last 90 days";
  const selectedLabel = chosen ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${chosen.date}T00:00:00Z`)) : "";

  return <section className="account-panel dashboard-section play-activity" aria-labelledby="play-activity-title" aria-busy={loading}>
    <div className="account-section-heading"><h2 id="play-activity-title">Play activity</h2><CalendarDays size={19} aria-hidden="true" /></div>
    {loading ? <p className="account-muted" role="status">Loading your play activity…</p> : error ? <p className="account-muted">Play activity is unavailable. Use the retry above to reconnect.</p> : <>
      <ActivityHeatmap
        days={days}
        label={`Daily recorded game sessions in ${period}. Dates use UTC.`}
        period={period}
        unit={{ one: "recorded session", other: "recorded sessions" }}
        weekStartsOn={1}
        selectedDate={selected}
        onSelectDate={setSelected}
        actions={<div className="activity-period-control"><label className="sr-only" htmlFor="activity-period">Activity period</label><select id="activity-period" value={range} onChange={(event) => { setRange(event.target.value === "90" ? 90 : 365); setSelected(null); }}><option value="365">Last year</option><option value="90">Last 90 days</option></select></div>}
      />
      <p className="activity-day-detail" role="status">{chosen ? `${chosen.count || "No"} recorded ${chosen.count === 1 ? "session" : "sessions"} on ${selectedLabel}.` : "Select a day to see your recorded sessions. Dates use UTC."}</p>
      {!hasDailyData && <p className="activity-pending-note">Your play history will appear here as games connect to Vihar ID.</p>}
    </>}
  </section>;
}
