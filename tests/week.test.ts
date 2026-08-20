import { describe, expect, it } from "vitest";
import type { Entry, Goals, Nutrient } from "../src/domain/types";
import {
  entriesInWeek,
  filterEntriesByDateRange,
  remainingNutrient,
  weeklyGoals,
} from "../src/domain/week";
import { sumNutrition } from "../src/domain/nutrition";

const nutrient = (calories: number, protein = 0, fat = 0, carbs = 0): Nutrient => ({
  calories,
  protein,
  fat,
  carbs,
});

const entry = (id: string, date: string, cal: number): Entry => ({
  id,
  date,
  ts: Date.parse(`${date}T12:00:00`),
  foodId: "f1",
  foodName: "Food",
  method: "grams",
  qty: 100,
  nutrition: nutrient(cal),
});

describe("week", () => {
  it("weeklyGoals multiplies each field by 7", () => {
    const goals: Goals = { calories: 2000, protein: 150, fat: 65, carbs: 250 };
    expect(weeklyGoals(goals)).toEqual({
      calories: 14000,
      protein: 1050,
      fat: 455,
      carbs: 1750,
    });
  });

  it("filterEntriesByDateRange is inclusive and excludes outside", () => {
    const list = [
      entry("a", "2026-08-14", 100),
      entry("b", "2026-08-15", 200),
      entry("c", "2026-08-21", 300),
      entry("d", "2026-08-22", 400),
    ];
    expect(filterEntriesByDateRange(list, "2026-08-15", "2026-08-21").map((e) => e.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("remainingNutrient floors at 0 when over budget", () => {
    const eaten = nutrient(15000, 100, 50, 200);
    const budget = nutrient(14000, 1050, 455, 1750);
    expect(remainingNutrient(eaten, budget)).toEqual({
      calories: 0,
      protein: 950,
      fat: 405,
      carbs: 1550,
    });
  });

  it("US2 weekend fixture: Sat 3000 + Sun 2500 vs 2000×7", () => {
    const goals: Goals = { calories: 2000, protein: 150, fat: 65, carbs: 250 };
    const weekEntries = [
      entry("sat", "2026-08-15", 3000),
      entry("sun", "2026-08-16", 2500),
    ];
    const monday = "2026-08-17";
    const inWeek = entriesInWeek(weekEntries, monday);
    const eaten = sumNutrition(inWeek);
    const budget = weeklyGoals(goals);
    const left = remainingNutrient(eaten, budget);

    expect(eaten.calories).toBe(5500);
    expect(budget.calories).toBe(14000);
    expect(left.calories).toBe(8500);
    expect(entriesInWeek([...weekEntries, entry("prev", "2026-08-14", 999)], monday).map((e) => e.id)).toEqual([
      "sat",
      "sun",
    ]);
  });
});
