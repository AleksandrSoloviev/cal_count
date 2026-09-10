import { describe, expect, it } from "vitest";
import {
  filterFoodsByName,
  foodNameMatches,
  normalizeFoodNameQuery,
} from "../src/domain/foodNameFilter";
import type { Food } from "../src/domain/types";

const nutrient = { calories: 10, protein: 1, fat: 2, carbs: 3 };

const makeFood = (partial: Pick<Food, "id" | "name"> & Partial<Food>): Food => ({
  isDefault: false,
  method: "grams",
  perUnit: nutrient,
  ...partial,
});

const oatMilk = makeFood({ id: "a", name: "Oat milk" });
const oliveOil = makeFood({ id: "b", name: "Olive oil" });
const chicken = makeFood({ id: "c", name: "Chicken" });
const library = [oatMilk, oliveOil, chicken];

describe("normalizeFoodNameQuery", () => {
  it("trims and lowercases", () => {
    expect(normalizeFoodNameQuery("")).toBe("");
    expect(normalizeFoodNameQuery("   ")).toBe("");
    expect(normalizeFoodNameQuery(" Oil ")).toBe("oil");
    expect(normalizeFoodNameQuery("OAT")).toBe("oat");
  });
});

describe("foodNameMatches", () => {
  it("matches empty needle against every name", () => {
    expect(foodNameMatches("Olive oil", "")).toBe(true);
  });

  it("matches case-insensitive substrings", () => {
    expect(foodNameMatches("Olive oil", "oil")).toBe(true);
    expect(foodNameMatches("Oat milk", "at m")).toBe(true);
    expect(foodNameMatches("Olive oil", "at m")).toBe(false);
    expect(foodNameMatches("Chicken", "oil")).toBe(false);
    expect(foodNameMatches("100% juice", "100%")).toBe(true);
  });
});

describe("filterFoodsByName", () => {
  it("returns the same array for empty or whitespace queries", () => {
    expect(filterFoodsByName(library, "")).toBe(library);
    expect(filterFoodsByName(library, "  ")).toBe(library);
    expect(filterFoodsByName(library, "").map((f) => f.name)).toEqual([
      "Oat milk",
      "Olive oil",
      "Chicken",
    ]);
  });

  it("filters by case-insensitive substring and keeps input order", () => {
    expect(filterFoodsByName(library, "oil").map((f) => f.name)).toEqual(["Olive oil"]);
    expect(filterFoodsByName(library, "OIL").map((f) => f.name)).toEqual(["Olive oil"]);
    expect(filterFoodsByName(library, "at m").map((f) => f.name)).toEqual(["Oat milk"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterFoodsByName(library, "zzz")).toEqual([]);
  });

  it("treats punctuation as literal", () => {
    const juice = makeFood({ id: "j", name: "100% juice" });
    expect(filterFoodsByName([juice, ...library], "100%").map((f) => f.name)).toEqual([
      "100% juice",
    ]);
  });

  it("keeps duplicate names as separate rows", () => {
    const milkA = makeFood({ id: "m1", name: "Milk" });
    const milkB = makeFood({ id: "m2", name: "Milk" });
    expect(filterFoodsByName([milkA, chicken, milkB], "milk").map((f) => f.id)).toEqual([
      "m1",
      "m2",
    ]);
  });

  it("does not match id or component names", () => {
    const salad = makeFood({
      id: "chicken-id",
      name: "Salad",
      method: "custom",
      components: [{ id: "x", name: "Chicken", decimals: false, nutrition: nutrient }],
    });
    expect(filterFoodsByName([salad], "chicken")).toEqual([]);
    expect(filterFoodsByName([salad], "chicken-id")).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const snapshot = [...library];
    filterFoodsByName(library, "oil");
    expect(library).toEqual(snapshot);
  });
});
