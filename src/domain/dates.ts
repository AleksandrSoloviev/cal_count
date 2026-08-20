import type { WeekWindow } from "./types";

export const todayStr = (now = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseLocalNoon = (dateStr: string): Date => new Date(`${dateStr}T12:00:00`);

/** Local-calendar Saturday–Friday week containing `today` (YYYY-MM-DD). */
export const weekBoundsSatFri = (today: string): WeekWindow => {
  const d = parseLocalNoon(today);
  const daysSinceSaturday = (d.getDay() + 1) % 7;
  const start = new Date(d);
  start.setDate(start.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start: todayStr(start), end: todayStr(end) };
};

/** e.g. `Sat Aug 16 – Fri Aug 22` (no commas; matches product copy) */
export const fmtWeekRange = (start: string, end: string): string => {
  const fmtOne = (dateStr: string): string => {
    const d = parseLocalNoon(dateStr);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    return `${weekday} ${month} ${day}`;
  };
  return `${fmtOne(start)} – ${fmtOne(end)}`;
};

export const dateOffset = (daysAgo: number, now = new Date()): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return todayStr(d);
};

export const fmtDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const fmtTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const greetingForHour = (hour: number): "morning" | "afternoon" | "evening" => {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

export const msUntilNextLocalMidnight = (now = new Date()): number => {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};
