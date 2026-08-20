import { describe, expect, it } from "vitest";
import { DEFAULT_FOODS } from "../src/domain/defaults";
import {
  compareFoodsByPopularity,
  countFoodUsage,
  sortFoodsByPopularity,
} from "../src/domain/foodPopularity";
import type { Entry, Food } from "../src/domain/types";

const nutrient = { calories: 10, protein: 1, fat: 2, carbs: 3 };

const makeFood = (partial: Pick<Food, "id" | "name"> & Partial<Food>): Food => ({
  isDefault: false,
  method: "grams",
  perUnit: nutrient,
  ...partial,
});

const makeEntry = (foodId: string, id = `${foodId}-${Math.random()}`): Entry => ({
  id,
  date: "2026-08-20",
  ts: Date.now(),
  foodId,
  foodName: foodId,
  method: "grams",
  qty: 100,
  nutrition: nutrient,
});

const nEntries = (foodId: string, n: number): Entry[] =>
  Array.from({ length: n }, (_, i) => makeEntry(foodId, `${foodId}-${i}`));

describe("countFoodUsage", () => {
  it("returns empty map for no entries", () => {
    expect(countFoodUsage([])).toEqual(new Map());
  });

  it("counts foodIds", () => {
    const map = countFoodUsage([
      makeEntry("a", "1"),
      makeEntry("a", "2"),
      makeEntry("b", "3"),
    ]);
    expect(map.get("a")).toBe(2);
    expect(map.get("b")).toBe(1);
  });

  it("counts orphan foodIds not in the library", () => {
    const map = countFoodUsage([makeEntry("x", "1")]);
    expect(map.get("x")).toBe(1);
  });
});

describe("compareFoodsByPopularity / sortFoodsByPopularity", () => {
  it("returns empty for empty foods", () => {
    expect(sortFoodsByPopularity([], nEntries("a", 3))).toEqual([]);
  });

  it("sorts by frequency descending (A:5, B:2, C:0)", () => {
    const foods = [makeFood({ id: "C", name: "C" }), makeFood({ id: "A", name: "A" }), makeFood({ id: "B", name: "B" })];
    const entries = [...nEntries("A", 5), ...nEntries("B", 2)];
    expect(sortFoodsByPopularity(foods, entries).map((f) => f.id)).toEqual(["A", "B", "C"]);
  });

  it("prefers higher lastUsed when frequency is equal", () => {
    const foods = [
      makeFood({ id: "A", name: "A", lastUsed: 100 }),
      makeFood({ id: "B", name: "B", lastUsed: 200 }),
    ];
    const entries = [...nEntries("A", 1), ...nEntries("B", 1)];
    expect(sortFoodsByPopularity(foods, entries).map((f) => f.id)).toEqual(["B", "A"]);
  });

  it("lets frequency beat a more recent but less-used food", () => {
    const foods = [
      makeFood({ id: "A", name: "A", lastUsed: 100 }),
      makeFood({ id: "B", name: "B", lastUsed: 999 }),
    ];
    const entries = [...nEntries("A", 3), ...nEntries("B", 1)];
    expect(sortFoodsByPopularity(foods, entries).map((f) => f.id)).toEqual(["A", "B"]);
  });

  it("sorts unused foods by case-insensitive name", () => {
    const foods = [
      makeFood({ id: "b", name: "Banana" }),
      makeFood({ id: "a", name: "Apple" }),
    ];
    expect(sortFoodsByPopularity(foods, []).map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("breaks remaining ties by id", () => {
    const foods = [
      makeFood({ id: "z", name: "Same" }),
      makeFood({ id: "a", name: "Same" }),
    ];
    expect(sortFoodsByPopularity(foods, []).map((f) => f.id)).toEqual(["a", "z"]);
  });

  it("does not mutate the input foods array", () => {
    const foods = [
      makeFood({ id: "C", name: "C" }),
      makeFood({ id: "A", name: "A" }),
    ];
    const snapshot = foods.map((f) => f.id);
    sortFoodsByPopularity(foods, nEntries("A", 1));
    expect(foods.map((f) => f.id)).toEqual(snapshot);
  });

  it("places a once-logged custom food above never-logged defaults", () => {
    const custom = makeFood({ id: "custom-1", name: "My Shake" });
    const foods = [...DEFAULT_FOODS, custom];
    const entries = [makeEntry("custom-1", "e1")];
    const ordered = sortFoodsByPopularity(foods, entries);
    expect(ordered[0].id).toBe("custom-1");
    expect(ordered.slice(1).every((f) => f.isDefault)).toBe(true);
  });

  it("compare returns negative when a should come before b", () => {
    const usage = new Map([["a", 2], ["b", 1]]);
    const a = makeFood({ id: "a", name: "A" });
    const b = makeFood({ id: "b", name: "B" });
    expect(compareFoodsByPopularity(a, b, usage)).toBeLessThan(0);
  });
});
