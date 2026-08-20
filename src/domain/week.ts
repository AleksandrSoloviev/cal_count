import { weekBoundsSatFri } from "./dates";
import type { Entry, Goals, Nutrient } from "./types";

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
