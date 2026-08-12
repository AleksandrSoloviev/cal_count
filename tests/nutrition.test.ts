import { describe, expect, it } from "vitest";
import { calcNutrition, displayVal, r1, sumNutrition } from "../src/domain/nutrition";
import type { Food } from "../src/domain/types";

describe("nutrition", () => {
  it("calculates grams per 100g", () => {
    const food: Food = {
      id: "1",
      name: "Chicken",
      isDefault: true,
      method: "grams",
      perUnit: { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    };
    expect(calcNutrition(food, 200)).toEqual({
      calories: 330,
      protein: 62,
      fat: 7.2,
      carbs: 0,
    });
  });

  it("calculates pieces", () => {
    const food: Food = {
      id: "2",
      name: "Banana",
      isDefault: true,
      method: "pieces",
      perUnit: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    };
    expect(calcNutrition(food, 2).calories).toBe(178);
  });

  it("calculates custom components", () => {
    const food: Food = {
      id: "df-eggs",
      name: "Eggs",
      isDefault: true,
      method: "custom",
      components: [
        { id: "white", name: "White", decimals: false, nutrition: { calories: 17, protein: 3.6, fat: 0.1, carbs: 0.2 } },
        { id: "yolk", name: "Yolk", decimals: false, nutrition: { calories: 55, protein: 2.7, fat: 4.5, carbs: 0.6 } },
      ],
    };
    const n = calcNutrition(food, undefined, { white: 2, yolk: 1 });
    expect(n.calories).toBe(89);
    expect(r1(n.protein)).toBe(9.9);
  });

  it("sums entries", () => {
    const total = sumNutrition([
      { nutrition: { calories: 100, protein: 10, fat: 1, carbs: 2 } },
      { nutrition: { calories: 50, protein: 5, fat: 2, carbs: 3 } },
    ]);
    expect(total).toEqual({ calories: 150, protein: 15, fat: 3, carbs: 5 });
  });

  it("displays kcal rounded", () => {
    expect(displayVal(12.6, "kcal")).toBe("13");
    expect(displayVal(12.0, "g")).toBe("12");
  });
});
