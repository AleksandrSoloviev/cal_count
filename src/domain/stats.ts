import {
  addDays,
  countInclusiveDays,
  fmtMonthDay,
  monthBounds,
  statsLookback,
  weekBoundsSatFri,
  type DateRange,
} from "./dates";
import { r1, sumNutrition, ZERO_NUTRIENT } from "./nutrition";
import type { Entry, Nutrient, StatsGranularity, StatsPeriod } from "./types";
import { filterEntriesByDateRange } from "./week";

export type StatsBucket = {
  key: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
  clipStart: string;
  clipEnd: string;
  intersectionDays: number;
  totals: Nutrient;
  hasEntries: boolean;
};

export const intersectRange = (a: DateRange, b: DateRange): DateRange | null => {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  if (start > end) return null;
  return { start, end };
};

export const grainForPeriod = (period: StatsPeriod): StatsGranularity => {
  if (period === "7d" || period === "30d") return "day";
  if (period === "90d") return "week";
  return "month";
};

const shortWeekday = (date: string): string =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });

const shortMonth = (date: string): string =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short" });

const nextMonthStart = (monthStart: string): string => {
  const d = new Date(`${monthStart}T12:00:00`);
  d.setMonth(d.getMonth() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

const canonicalRange = (date: string, grain: StatsGranularity): { key: string; range: DateRange } => {
  if (grain === "day") return { key: date, range: { start: date, end: date } };
  if (grain === "week") {
    const week = weekBoundsSatFri(date);
    return { key: week.start, range: week };
  }
  const range = monthBounds(date);
  return { key: date.slice(0, 7), range };
};

const bucketLabel = (grain: StatsGranularity, period: StatsPeriod, range: DateRange, lookback: DateRange): string => {
  if (grain === "day") {
    return period === "7d" ? shortWeekday(range.start) : fmtMonthDay(range.start);
  }
  if (grain === "week") return fmtMonthDay(range.start);
  const month = shortMonth(range.start);
  const spansYears = lookback.start.slice(0, 4) !== lookback.end.slice(0, 4);
  if (!spansYears) return month;
  return `${month} ${range.start.slice(0, 4)}`;
};

const walkSlotStarts = (lookback: DateRange, grain: StatsGranularity): string[] => {
  if (grain === "day") {
    const dates: string[] = [];
    for (let date = lookback.start; date <= lookback.end; date = addDays(date, 1)) {
      dates.push(date);
    }
    return dates;
  }
  if (grain === "week") {
    const starts: string[] = [];
    let start = weekBoundsSatFri(lookback.start).start;
    while (start <= lookback.end) {
      starts.push(start);
      start = addDays(start, 7);
    }
    return starts;
  }
  const starts: string[] = [];
  let start = monthBounds(lookback.start).start;
  while (start <= lookback.end) {
    starts.push(start);
    start = nextMonthStart(start);
  }
  return starts;
};

export const buildStatsBuckets = (args: {
  entries: Entry[];
  today: string;
  period: StatsPeriod;
}): StatsBucket[] => {
  const lookback = statsLookback(args.period, args.today);
  const inWindow = filterEntriesByDateRange(args.entries, lookback.start, lookback.end);
  if (inWindow.length === 0) return [];

  const grain = grainForPeriod(args.period);
  const buckets: StatsBucket[] = [];

  for (const slotDate of walkSlotStarts(lookback, grain)) {
    const { key, range } = canonicalRange(slotDate, grain);
    const clip = intersectRange(range, lookback);
    if (!clip) continue;
    const items = inWindow.filter((entry) => entry.date >= clip.start && entry.date <= clip.end);
    buckets.push({
      key,
      label: bucketLabel(grain, args.period, range, lookback),
      rangeStart: range.start,
      rangeEnd: range.end,
      clipStart: clip.start,
      clipEnd: clip.end,
      intersectionDays: countInclusiveDays(clip.start, clip.end),
      totals: items.length === 0 ? { ...ZERO_NUTRIENT } : sumNutrition(items),
      hasEntries: items.length > 0,
    });
  }

  buckets.sort((a, b) => a.clipStart.localeCompare(b.clipStart));
  return buckets;
};

export const statsDailyEquivalent = (total: number, intersectionDays: number): number => {
  if (intersectionDays < 1) return 0;
  return r1(total / intersectionDays);
};

export const statsAverageLogged = (buckets: StatsBucket[], nutrientKey: keyof Nutrient): number => {
  const logged = buckets.filter((bucket) => bucket.hasEntries);
  if (logged.length === 0) return 0;
  const sum = logged.reduce(
    (acc, bucket) => acc + statsDailyEquivalent(bucket.totals[nutrientKey], bucket.intersectionDays),
    0,
  );
  return r1(sum / logged.length);
};

export const statsPointOverflows = (dailyEquivalent: number, dailyGoal: number): boolean =>
  dailyEquivalent > dailyGoal;

export const statsYDomainMax = (values: number[], dailyGoal: number): number => {
  const peak = values.length === 0 ? 0 : Math.max(...values);
  return Math.round(Math.max(peak, dailyGoal, 0) * 1.1);
};

export const statsTickIndices = (length: number): number[] => {
  if (length <= 0) return [];
  if (length <= 7) return Array.from({ length }, (_, i) => i);
  const count = length <= 14 ? 5 : 6;
  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (length - 1)) / (count - 1));
    if (indices[indices.length - 1] !== idx) indices.push(idx);
  }
  return indices;
};

export const statsBarSegments = (
  dailyEquivalent: number,
  dailyGoal: number,
): { withinGoal: number; overshoot: number } => ({
  withinGoal: Math.min(dailyEquivalent, dailyGoal),
  overshoot: Math.max(0, dailyEquivalent - dailyGoal),
});
