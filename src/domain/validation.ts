import type { Goals, Method } from "./types";

export type FieldErrors = Partial<Record<keyof Goals, string>>;

export const validateGoals = (vals: {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}): { ok: true; goals: Goals } | { ok: false; errors: FieldErrors } => {
  const errors: FieldErrors = {};
  const cal = parseInt(vals.calories, 10);
  const prot = parseFloat(vals.protein);
  const fatV = parseFloat(vals.fat);
  const carbsV = parseFloat(vals.carbs);

  if (!vals.calories || Number.isNaN(cal) || cal < 500 || cal > 10000) {
    errors.calories = "Enter a whole number between 500 and 10,000";
  }
  if (vals.protein === "" || Number.isNaN(prot) || prot < 0 || prot > 1000) {
    errors.protein = "Enter a value between 0 and 1,000";
  }
  if (vals.fat === "" || Number.isNaN(fatV) || fatV < 0 || fatV > 1000) {
    errors.fat = "Enter a value between 0 and 1,000";
  }
  if (vals.carbs === "" || Number.isNaN(carbsV) || carbsV < 0 || carbsV > 1000) {
    errors.carbs = "Enter a value between 0 and 1,000";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, goals: { calories: cal, protein: prot, fat: fatV, carbs: carbsV } };
};

export const maxQtyForMethod = (method: Method): number =>
  method === "grams" || method === "milliliters" ? 10000 : 100;

export const validateSimpleQty = (
  method: Method,
  qtyRaw: string,
): { ok: true; qty: number } | { ok: false; error: string } => {
  const max = maxQtyForMethod(method);
  const qty = parseFloat(qtyRaw);
  if (Number.isNaN(qty) || qty <= 0) return { ok: false, error: "Enter a positive quantity" };
  if (qty > max) return { ok: false, error: `Maximum is ${max}` };
  return { ok: true, qty };
};

export const validateCompQty = (
  compQty: Record<string, string>,
): { ok: true; parsed: Record<string, number> } | { ok: false; error: string } => {
  const parsed: Record<string, number> = {};
  let any = false;
  for (const [id, raw] of Object.entries(compQty)) {
    const v = parseFloat(raw);
    const n = Number.isNaN(v) ? 0 : v;
    parsed[id] = n;
    if (n > 0) any = true;
  }
  if (!any) return { ok: false, error: "Enter at least one component quantity" };
  return { ok: true, parsed };
};
