import type { Food } from "./types";

export const DEFAULT_FOODS: Food[] = [
  {
    id: "df-eggs",
    name: "Eggs",
    isDefault: true,
    method: "custom",
    components: [
      { id: "white", name: "White", decimals: false, nutrition: { calories: 17, protein: 3.6, fat: 0.1, carbs: 0.2 } },
      { id: "yolk", name: "Yolk", decimals: false, nutrition: { calories: 55, protein: 2.7, fat: 4.5, carbs: 0.6 } },
    ],
  },
  { id: "df-chicken", name: "Chicken breast", isDefault: true, method: "grams", perUnit: { calories: 165, protein: 31, fat: 3.6, carbs: 0 } },
  { id: "df-buckwheat", name: "Buckwheat", isDefault: true, method: "grams", perUnit: { calories: 343, protein: 13, fat: 3.4, carbs: 71 } },
  { id: "df-oatmeal", name: "Oatmeal", isDefault: true, method: "grams", perUnit: { calories: 389, protein: 17, fat: 7, carbs: 66 } },
  { id: "df-milk", name: "Milk", isDefault: true, method: "milliliters", perUnit: { calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8 } },
  { id: "df-rice", name: "White rice (cooked)", isDefault: true, method: "grams", perUnit: { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 } },
  { id: "df-banana", name: "Banana", isDefault: true, method: "pieces", perUnit: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23 } },
  { id: "df-greek-yogurt", name: "Greek yogurt", isDefault: true, method: "grams", perUnit: { calories: 59, protein: 10, fat: 0.4, carbs: 3.6 } },
  { id: "df-cottage-cheese", name: "Cottage cheese", isDefault: true, method: "grams", perUnit: { calories: 98, protein: 11, fat: 4.3, carbs: 3.4 } },
  { id: "df-olive-oil", name: "Olive oil", isDefault: true, method: "milliliters", perUnit: { calories: 884, protein: 0, fat: 100, carbs: 0 } },
];
