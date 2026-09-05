import { weekBoundsSatFri } from "./dates";
import type { Entry, Goals, Nutrient, WeekWindow } from "./types";

export const filterEntriesByDateRange = (
  entries: Entry[],
  start: string,
  end: string,
): Entry[] => entries.filter((e) => e.date >= start && e.date <= end);

export const entriesInWeek = (entries: Entry[], today: string): Entry[] => {
  const { start, end } = weekBoundsSatFri(today);
  return filterEntriesByDateRange(entries, start, end);
};

export const weeklyGoals = (goals: Goals): Goals => ({
  calories: goals.calories * 7,
  protein: goals.protein * 7,
  fat: goals.fat * 7,
  carbs: goals.carbs * 7,
});

export const remainingNutrient = (eaten: Nutrient, budget: Nutrient): Nutrient => ({
  calories: Math.max(0, budget.calories - eaten.calories),
  protein: Math.max(0, budget.protein - eaten.protein),
  fat: Math.max(0, budget.fat - eaten.fat),
  carbs: Math.max(0, budget.carbs - eaten.carbs),
});

/** Completed Sat–Fri windows only (`end < today`), newest first. */
export const listCompletedWeekWindows = (entries: Entry[], today: string): WeekWindow[] => {
  const byStart = new Map<string, WeekWindow>();
  for (const item of entries) {
    const window = weekBoundsSatFri(item.date);
    if (window.end >= today) continue;
    byStart.set(window.start, window);
  }
  return [...byStart.values()].sort((a, b) => b.start.localeCompare(a.start));
};
