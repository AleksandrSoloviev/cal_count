import type { Entry, Nutrient } from "./types";

export type OneOffFieldError = "name" | "calories" | "protein" | "fat" | "carbs";

export type OneOffDraft = {
  name: string;
  nutrition: Nutrient;
};

const NUTRIENT_KEYS = ["calories", "protein", "fat", "carbs"] as const;

export const isOneOffEntry = (entry: Entry): boolean => entry.oneOff === true;

const isFiniteNonNegative = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;

export const validateOneOffDraft = (
  draft: OneOffDraft,
):
  | { ok: true; name: string; nutrition: Nutrient }
  | { ok: false; errors: OneOffFieldError[] } => {
  const errors: OneOffFieldError[] = [];
  const name = draft.name.trim();
  if (!name) errors.push("name");
  for (const key of NUTRIENT_KEYS) {
    if (!isFiniteNonNegative(draft.nutrition?.[key])) errors.push(key);
  }
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    name,
    nutrition: {
      calories: draft.nutrition.calories,
      protein: draft.nutrition.protein,
      fat: draft.nutrition.fat,
      carbs: draft.nutrition.carbs,
    },
  };
};

export const buildOneOffEntry = (input: {
  id: string;
  foodId: string;
  date: string;
  ts: number;
  name: string;
  nutrition: Nutrient;
}): Entry => ({
  id: input.id,
  foodId: input.foodId,
  date: input.date,
  ts: input.ts,
  foodName: input.name,
  method: "pieces",
  oneOff: true,
  nutrition: { ...input.nutrition },
});

export const applyOneOffEdit = (entry: Entry, name: string, nutrition: Nutrient): Entry => {
  if (!isOneOffEntry(entry)) {
    throw new Error("applyOneOffEdit requires a one-off entry");
  }
  return {
    ...entry,
    foodName: name,
    nutrition: { ...nutrition },
  };
};
