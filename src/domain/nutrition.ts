import type { Food, Nutrient } from "./types";

export const ZERO_NUTRIENT: Nutrient = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
};

export const NUTRIENT_META = [
  { key: "calories" as const, label: "Calories", unit: "kcal", color: "#16a34a" },
  { key: "protein" as const, label: "Protein", unit: "g", color: "#2563eb" },
  { key: "fat" as const, label: "Fat", unit: "g", color: "#d97706" },
  { key: "carbs" as const, label: "Carbs", unit: "g", color: "#7c3aed" },
];

export const OVERFLOW_COLOR = "#ef4444";

export const r1 = (n: number): number => Math.round(n * 10) / 10;

export const displayVal = (n: number, unit: string): string => {
  if (unit === "kcal") return String(Math.round(n));
  const v = r1(n);
  return v % 1 === 0 ? String(v) : v.toFixed(1);
};

export const calcNutrition = (
  food: Food,
  qty?: number,
  compQty?: Record<string, number>,
): Nutrient => {
  if (food.method === "custom" && food.components && compQty) {
    return food.components.reduce((acc, c) => {
      const q = compQty[c.id] ?? 0;
      return {
        calories: acc.calories + c.nutrition.calories * q,
        protein: acc.protein + c.nutrition.protein * q,
        fat: acc.fat + c.nutrition.fat * q,
        carbs: acc.carbs + c.nutrition.carbs * q,
      };
    }, { ...ZERO_NUTRIENT });
  }
  if (!qty || !food.perUnit) return { ...ZERO_NUTRIENT };
  const factor = food.method === "pieces" ? qty : qty / 100;
  return {
    calories: food.perUnit.calories * factor,
    protein: food.perUnit.protein * factor,
    fat: food.perUnit.fat * factor,
    carbs: food.perUnit.carbs * factor,
  };
};

export const sumNutrition = (entries: { nutrition: Nutrient }[]): Nutrient =>
  entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.nutrition.calories,
      protein: acc.protein + e.nutrition.protein,
      fat: acc.fat + e.nutrition.fat,
      carbs: acc.carbs + e.nutrition.carbs,
    }),
    { ...ZERO_NUTRIENT },
  );
