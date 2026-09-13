import type { StatsPeriod, WeekWindow } from "./types";

export type DateRange = {
  start: string;
  end: string;
};

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

export const addDays = (dateStr: string, delta: number): string => {
  const d = parseLocalNoon(dateStr);
  d.setDate(d.getDate() + delta);
  return todayStr(d);
};

export const daysInCalendarMonth = (dateStr: string): number => {
  const d = parseLocalNoon(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

export const monthBounds = (dateStr: string): DateRange => {
  const d = parseLocalNoon(dateStr);
  const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  const last = daysInCalendarMonth(dateStr);
  const end = `${start.slice(0, 8)}${String(last).padStart(2, "0")}`;
  return { start, end };
};

export const countInclusiveDays = (start: string, end: string): number => {
  const ms = parseLocalNoon(end).getTime() - parseLocalNoon(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
};

/** Inclusive lookback ending on `today`. */
export const statsLookback = (period: StatsPeriod, today: string): DateRange => {
  if (period === "7d") return { start: addDays(today, -6), end: today };
  if (period === "30d") return { start: addDays(today, -29), end: today };
  if (period === "90d") return { start: addDays(today, -89), end: today };
  const d = parseLocalNoon(today);
  d.setDate(1);
  d.setMonth(d.getMonth() - 11);
  return { start: todayStr(d), end: today };
};

export const fmtDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

/** Month + day, no weekday — e.g. `Sep 11`. */
export const fmtMonthDay = (dateStr: string): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const fmtTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const greetingForHour = (hour: number): "morning" | "afternoon" | "evening" => {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

/** Same local clock time as `ts`, on `targetDate` (YYYY-MM-DD). */
export const shiftTsToDate = (ts: number, targetDate: string): number => {
  const src = new Date(ts);
  const [year, month, day] = targetDate.split("-").map(Number);
  const next = new Date(
    year,
    month - 1,
    day,
    src.getHours(),
    src.getMinutes(),
    src.getSeconds(),
    src.getMilliseconds(),
  );
  return next.getTime();
};

export const msUntilNextLocalMidnight = (now = new Date()): number => {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};
