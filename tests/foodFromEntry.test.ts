import { describe, expect, it } from "vitest";
import { foodFromEntry } from "../src/domain/foodFromEntry";
import { calcNutrition } from "../src/domain/nutrition";
import type { Entry } from "../src/domain/types";

describe("foodFromEntry", () => {
  it("reconstructs grams food so preview matches entry nutrition", () => {
    const entry: Entry = {
      id: "e1",
      date: "2026-08-12",
      ts: 1,
      foodId: "gone",
      foodName: "Chicken breast",
      method: "grams",
      qty: 200,
      nutrition: { calories: 330, protein: 62, fat: 7.2, carbs: 0 },
    };
    const food = foodFromEntry(entry);
    expect(food.method).toBe("grams");
    expect(calcNutrition(food, 200)).toEqual(entry.nutrition);
  });

  it("reconstructs custom components for orphan edit", () => {
    const entry: Entry = {
      id: "e2",
      date: "2026-08-12",
      ts: 1,
      foodId: "df-eggs",
      foodName: "Eggs",
      method: "custom",
      compQty: { white: 2, yolk: 1 },
      nutrition: { calories: 89, protein: 9.9, fat: 4.7, carbs: 1 },
    };
    const food = foodFromEntry(entry);
    expect(food.method).toBe("custom");
    expect(food.components?.length).toBe(2);
    const preview = calcNutrition(food, undefined, entry.compQty);
    expect(Math.round(preview.calories)).toBe(89);
  });
});
