import type { Food } from "./types";

export type FoodPatch = Omit<Food, "id" | "isDefault">;

/** In-place library update. Preserves id and isDefault. No-op if id missing. */
export const applyFoodUpdate = (foods: Food[], id: string, patch: FoodPatch): Food[] => {
  const exists = foods.some((f) => f.id === id);
  if (!exists) return foods;

  return foods.map((f) => {
    if (f.id !== id) return f;
    if (patch.method === "custom") {
      return {
        id: f.id,
        isDefault: f.isDefault,
        lastUsed: patch.lastUsed !== undefined ? patch.lastUsed : f.lastUsed,
        name: patch.name,
        method: "custom" as const,
        components: patch.components,
      };
    }
    return {
      id: f.id,
      isDefault: f.isDefault,
      lastUsed: patch.lastUsed !== undefined ? patch.lastUsed : f.lastUsed,
      name: patch.name,
      method: patch.method,
      perUnit: patch.perUnit,
    };
  });
};
