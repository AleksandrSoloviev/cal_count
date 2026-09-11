import {
  countInclusiveDays,
  fmtDate,
  fmtWeekRange,
  monthBounds,
  statsLookback,
  daysInCalendarMonth,
  weekBoundsSatFri,
  type DateRange,
} from "./dates";
import { r1, sumNutrition } from "./nutrition";
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
};

export const intersectRange = (a: DateRange, b: DateRange): DateRange | null => {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  if (start > end) return null;
  return { start, end };
};

const canonicalRange = (date: string, granularity: StatsGranularity): { key: string; range: DateRange } => {
  if (granularity === "day") return { key: date, range: { start: date, end: date } };
  if (granularity === "week") {
    const week = weekBoundsSatFri(date);
    return { key: week.start, range: week };
  }
  const range = monthBounds(date);
  return { key: date.slice(0, 7), range };
};

const bucketLabel = (
  granularity: StatsGranularity,
  period: StatsPeriod,
  range: DateRange,
  lookback: DateRange,
): string => {
  if (granularity === "day") {
    return period === "7d"
      ? new Date(`${range.start}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })
      : fmtDate(range.start);
  }
  if (granularity === "week") return fmtWeekRange(range.start, range.end);
  const month = new Date(`${range.start}T12:00:00`).toLocaleDateString("en-US", { month: "short" });
  const spansYears = lookback.start.slice(0, 4) !== lookback.end.slice(0, 4);
  if (!spansYears) return month;
  return `${month} ${range.start.slice(0, 4)}`;
};

export const buildStatsBuckets = (args: {
  entries: Entry[];
  today: string;
  period: StatsPeriod;
  granularity: StatsGranularity;
}): StatsBucket[] => {
  const lookback = statsLookback(args.period, args.today);
  const inWindow = filterEntriesByDateRange(args.entries, lookback.start, lookback.end);
  const groups = new Map<string, { range: DateRange; items: Entry[] }>();

  for (const entry of inWindow) {
    const { key, range } = canonicalRange(entry.date, args.granularity);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(entry);
    } else {
      groups.set(key, { range, items: [entry] });
    }
  }

  const buckets: StatsBucket[] = [];
  for (const [key, group] of groups) {
    const clip = intersectRange(group.range, lookback);
    if (!clip) continue;
    buckets.push({
      key,
      label: bucketLabel(args.granularity, args.period, group.range, lookback),
      rangeStart: group.range.start,
      rangeEnd: group.range.end,
      clipStart: clip.start,
      clipEnd: clip.end,
      intersectionDays: countInclusiveDays(clip.start, clip.end),
      totals: sumNutrition(group.items),
    });
  }

  buckets.sort((a, b) => a.clipStart.localeCompare(b.clipStart));
  return buckets;
};

export const statsFullBucketGoal = (
  granularity: StatsGranularity,
  dailyGoal: number,
  today: string,
): number => {
  if (granularity === "day") return dailyGoal;
  if (granularity === "week") return dailyGoal * 7;
  return dailyGoal * daysInCalendarMonth(today);
};

export const statsBarOverflows = (
  value: number,
  dailyGoal: number,
  intersectionDays: number,
): boolean => r1(value) > dailyGoal * intersectionDays;
