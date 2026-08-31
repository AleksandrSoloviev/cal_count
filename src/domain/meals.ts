import { shiftTsToDate } from "./dates";
import { sumNutrition } from "./nutrition";
import type { Entry, EntryFocus, Meal } from "./types";

export const MEAL_GAP_MS = 30 * 60 * 1000;

const compareTsThenId = (a: Entry, b: Entry): number => {
  if (a.ts !== b.ts) return a.ts - b.ts;
  return a.id.localeCompare(b.id);
};

export const groupEntriesIntoMeals = (entries: Entry[]): Meal[] => {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort(compareTsThenId);
  const clusters: Entry[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (cur.ts - prev.ts <= MEAL_GAP_MS) {
      clusters[clusters.length - 1].push(cur);
    } else {
      clusters.push([cur]);
    }
  }

  return clusters.map((group, i) => ({
    index: i + 1,
    entries: group,
    nutrition: sumNutrition(group),
    startTs: group[0].ts,
    endTs: group[group.length - 1].ts,
  }));
};

const indexContaining = (meals: Meal[], id: string): number =>
  meals.findIndex((m) => m.entries.some((e) => e.id === id));

export const resolveExpandedMealIndex = (meals: Meal[], focus: EntryFocus): number | null => {
  if (meals.length === 0) return null;
  const latest = meals.length - 1;
  if (focus.kind === "latest") return latest;
  if (focus.kind === "entry") {
    const i = indexContaining(meals, focus.id);
    return i === -1 ? latest : i;
  }
  for (const id of focus.ids) {
    const i = indexContaining(meals, id);
    if (i !== -1) return i;
  }
  return latest;
};

export const moveEntriesToDate = (
  entries: Entry[],
  ids: readonly string[],
  targetDate: string,
): { entries: Entry[]; changed: boolean } => {
  if (ids.length === 0) return { entries, changed: false };
  const idSet = new Set(ids);
  const matched = entries.filter((e) => idSet.has(e.id));
  if (matched.length === 0) return { entries, changed: false };
  if (matched.every((e) => e.date === targetDate)) return { entries, changed: false };

  const next = entries.map((e) => {
    if (!idSet.has(e.id) || e.date === targetDate) return e;
    return { ...e, date: targetDate, ts: shiftTsToDate(e.ts, targetDate) };
  });
  return { entries: next, changed: true };
};
