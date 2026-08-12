import type { Entry, Food, Nutrient } from "./types";
import { ZERO_NUTRIENT } from "./nutrition";

const scaleNutrient = (n: Nutrient, factor: number): Nutrient => ({
  calories: n.calories * factor,
  protein: n.protein * factor,
  fat: n.fat * factor,
  carbs: n.carbs * factor,
});

/** Rebuild a Food for editing when the library item was deleted. */
export const foodFromEntry = (entry: Entry): Food => {
  if (entry.method === "custom" && entry.compQty) {
    const ids = Object.keys(entry.compQty);
    const primaryId =
      ids.find((id) => (entry.compQty?.[id] ?? 0) > 0) ?? ids[0] ?? "portion";
    const primaryQty = entry.compQty[primaryId] || 1;
    return {
      id: entry.foodId,
      name: entry.foodName,
      isDefault: false,
      method: "custom",
      components: (ids.length > 0 ? ids : [primaryId]).map((id) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        decimals: true,
        nutrition:
          id === primaryId
            ? scaleNutrient(entry.nutrition, 1 / primaryQty)
            : { ...ZERO_NUTRIENT },
      })),
    };
  }

  const qty = entry.qty && entry.qty > 0 ? entry.qty : 1;
  const factor = entry.method === "pieces" ? 1 / qty : 100 / qty;
  return {
    id: entry.foodId,
    name: entry.foodName,
    isDefault: false,
    method: entry.method === "custom" ? "pieces" : entry.method,
    perUnit: scaleNutrient(entry.nutrition, factor),
  };
};
