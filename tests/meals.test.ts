import { describe, expect, it } from "vitest";
import { MEAL_GAP_MS, groupEntriesIntoMeals, resolveExpandedMealIndex } from "../src/domain/meals";
import type { Entry } from "../src/domain/types";

const T0 = Date.parse("2026-08-13T12:00:00");

const makeEntry = (id: string, ts: number): Entry => ({
  id,
  date: "2026-08-13",
  ts,
  foodId: "food",
  foodName: id,
  method: "grams",
  qty: 100,
  nutrition: { calories: 10, protein: 1, fat: 2, carbs: 3 },
});

describe("groupEntriesIntoMeals", () => {
  it("returns empty for no entries", () => {
    expect(groupEntriesIntoMeals([])).toEqual([]);
  });

  it("puts a single entry in Meal 1", () => {
    const meals = groupEntriesIntoMeals([makeEntry("a", T0)]);
    expect(meals).toHaveLength(1);
    expect(meals[0].index).toBe(1);
    expect(meals[0].entries.map((e) => e.id)).toEqual(["a"]);
    expect(meals[0].nutrition).toEqual({ calories: 10, protein: 1, fat: 2, carbs: 3 });
    expect(meals[0].startTs).toBe(T0);
    expect(meals[0].endTs).toBe(T0);
  });

  it("keeps entries 30 minutes apart in the same meal", () => {
    const meals = groupEntriesIntoMeals([
      makeEntry("a", T0),
      makeEntry("b", T0 + MEAL_GAP_MS),
    ]);
    expect(meals).toHaveLength(1);
    expect(meals[0].entries.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("starts a new meal 1ms after 30 minutes", () => {
    const meals = groupEntriesIntoMeals([
      makeEntry("a", T0),
      makeEntry("b", T0 + MEAL_GAP_MS + 1),
    ]);
    expect(meals).toHaveLength(2);
    expect(meals[0].index).toBe(1);
    expect(meals[1].index).toBe(2);
    expect(meals[0].entries.map((e) => e.id)).toEqual(["a"]);
    expect(meals[1].entries.map((e) => e.id)).toEqual(["b"]);
  });

  it("chains 12:00 / 12:25 / 12:50 into one meal", () => {
    const meals = groupEntriesIntoMeals([
      makeEntry("c", T0 + 50 * 60 * 1000),
      makeEntry("a", T0),
      makeEntry("b", T0 + 25 * 60 * 1000),
    ]);
    expect(meals).toHaveLength(1);
    expect(meals[0].entries.map((e) => e.id)).toEqual(["a", "b", "c"]);
    expect(meals[0].nutrition.calories).toBe(30);
  });

  it("orders same-timestamp entries by id", () => {
    const meals = groupEntriesIntoMeals([makeEntry("b", T0), makeEntry("a", T0)]);
    expect(meals).toHaveLength(1);
    expect(meals[0].entries.map((e) => e.id)).toEqual(["a", "b"]);
  });
});

describe("resolveExpandedMealIndex", () => {
  const meals = groupEntriesIntoMeals([
    makeEntry("a", T0),
    makeEntry("b", T0 + MEAL_GAP_MS + 1),
    makeEntry("c", T0 + MEAL_GAP_MS + 2),
  ]);

  it("returns null for no meals", () => {
    expect(resolveExpandedMealIndex([], { kind: "latest" })).toBeNull();
    expect(resolveExpandedMealIndex([], { kind: "entry", id: "a" })).toBeNull();
  });

  it("returns the last index for latest", () => {
    expect(resolveExpandedMealIndex(meals, { kind: "latest" })).toBe(1);
  });

  it("returns the meal containing an entry id", () => {
    expect(resolveExpandedMealIndex(meals, { kind: "entry", id: "a" })).toBe(0);
    expect(resolveExpandedMealIndex(meals, { kind: "entry", id: "b" })).toBe(1);
  });

  it("falls back to latest when entry id is missing", () => {
    expect(resolveExpandedMealIndex(meals, { kind: "entry", id: "missing" })).toBe(1);
  });

  it("uses the first remaining id that still exists", () => {
    expect(resolveExpandedMealIndex(meals, { kind: "remaining", ids: ["gone", "a"] })).toBe(0);
    expect(resolveExpandedMealIndex(meals, { kind: "remaining", ids: ["gone"] })).toBe(1);
  });
});
