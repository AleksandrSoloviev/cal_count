import { describe, expect, it } from "vitest";
import {
  appendPieceFoodFromOneOff,
  applyOneOffEdit,
  buildOneOffEntry,
  buildPieceFoodFromOneOff,
  isOneOffEntry,
  validateOneOffDraft,
} from "../src/domain/oneOffEntry";
import { calcNutrition } from "../src/domain/nutrition";
import type { Entry, Food } from "../src/domain/types";

const zeros = { calories: 0, protein: 0, fat: 0, carbs: 0 };
const cafe = { calories: 10, protein: 1, fat: 2, carbs: 3 };

const libraryEntry = (): Entry => ({
  id: "lib",
  date: "2026-09-22",
  ts: 1,
  foodId: "food",
  foodName: "Egg",
  method: "pieces",
  qty: 1,
  nutrition: cafe,
});

describe("validateOneOffDraft", () => {
  it("trims the name and keeps the typed numbers", () => {
    const result = validateOneOffDraft({
      name: "  Noma  ",
      nutrition: { calories: 800, protein: 40, fat: 30, carbs: 50 },
    });
    expect(result).toEqual({
      ok: true,
      name: "Noma",
      nutrition: { calories: 800, protein: 40, fat: 30, carbs: 50 },
    });
  });

  it("rejects a whitespace-only name", () => {
    expect(validateOneOffDraft({ name: "   ", nutrition: zeros })).toEqual({
      ok: false,
      errors: ["name"],
    });
  });

  it("rejects an empty name", () => {
    expect(validateOneOffDraft({ name: "", nutrition: zeros })).toEqual({
      ok: false,
      errors: ["name"],
    });
  });

  it("allows all-zero nutrition when the name is present", () => {
    expect(validateOneOffDraft({ name: "Water", nutrition: zeros })).toEqual({
      ok: true,
      name: "Water",
      nutrition: zeros,
    });
  });

  it("rejects a negative calorie and leaves the other fields out of the error list", () => {
    const result = validateOneOffDraft({
      name: "Cafe",
      nutrition: { calories: -1, protein: 0, fat: 0, carbs: 0 },
    });
    expect(result).toEqual({ ok: false, errors: ["calories"] });
  });

  it("rejects a non-finite protein", () => {
    const result = validateOneOffDraft({
      name: "Cafe",
      nutrition: { calories: 0, protein: Number.NaN, fat: 0, carbs: 0 },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(["protein"]);
  });
});

describe("buildOneOffEntry", () => {
  it("sets oneOff, pieces method, and omits qty", () => {
    const entry = buildOneOffEntry({
      id: "e1",
      foodId: "f1",
      date: "2026-09-22",
      ts: 50,
      name: "Cafe",
      nutrition: cafe,
    });
    expect(entry).toEqual({
      id: "e1",
      foodId: "f1",
      date: "2026-09-22",
      ts: 50,
      foodName: "Cafe",
      method: "pieces",
      oneOff: true,
      nutrition: cafe,
    });
    expect(entry.qty).toBeUndefined();
    expect(entry.compQty).toBeUndefined();
    expect(isOneOffEntry(entry)).toBe(true);
  });
});

describe("applyOneOffEdit", () => {
  it("changes name and nutrition only and does not mutate the input", () => {
    const original = buildOneOffEntry({
      id: "e1",
      foodId: "f1",
      date: "2026-09-22",
      ts: 50,
      name: "Cafe",
      nutrition: cafe,
    });
    const next = applyOneOffEdit(original, "Noma", { calories: 800, protein: 40, fat: 30, carbs: 50 });
    expect(next.id).toBe("e1");
    expect(next.ts).toBe(50);
    expect(next.date).toBe("2026-09-22");
    expect(next.foodId).toBe("f1");
    expect(next.foodName).toBe("Noma");
    expect(next.nutrition.calories).toBe(800);
    expect(next.oneOff).toBe(true);
    expect(next.qty).toBeUndefined();
    expect(original.foodName).toBe("Cafe");
    expect(original.nutrition).toEqual(cafe);
  });

  it("throws on a library entry", () => {
    expect(() => applyOneOffEdit(libraryEntry(), "Cafe", cafe)).toThrow(/one-off/);
  });
});

const noma = { calories: 900, protein: 40, fat: 30, carbs: 50 };

const oneOffEntry = (): Entry =>
  buildOneOffEntry({
    id: "entry-1",
    foodId: "orphan-food",
    date: "2026-09-24",
    ts: 10,
    name: "Noma",
    nutrition: { calories: 800, protein: 40, fat: 30, carbs: 50 },
  });

const existingFood = (): Food => ({
  id: "existing",
  name: "Oatmeal",
  isDefault: false,
  method: "grams",
  perUnit: cafe,
});

describe("buildPieceFoodFromOneOff", () => {
  it("copies per-piece nutrition and does not mutate the input", () => {
    const nutrition = { ...noma };
    const food = buildPieceFoodFromOneOff({ id: "food-1", name: "Noma", nutrition });
    expect(food).toEqual({
      id: "food-1",
      name: "Noma",
      isDefault: false,
      method: "pieces",
      perUnit: noma,
    });
    expect(food.lastUsed).toBeUndefined();
    expect(food.components).toBeUndefined();
    food.perUnit!.calories = 1;
    expect(nutrition).toEqual(noma);
    expect(calcNutrition(buildPieceFoodFromOneOff({ id: "food-1", name: "Noma", nutrition: noma }), 1)).toEqual(noma);
    expect(calcNutrition(buildPieceFoodFromOneOff({ id: "food-1", name: "Noma", nutrition: noma }), 2)).toEqual({
      calories: 1800,
      protein: 80,
      fat: 60,
      carbs: 100,
    });
  });
});

describe("appendPieceFoodFromOneOff", () => {
  it("appends a trimmed piece food and leaves the entry unchanged", () => {
    const foods = [existingFood()];
    const entry = oneOffEntry();
    const result = appendPieceFoodFromOneOff(
      foods,
      entry,
      { name: "  Noma  ", nutrition: noma },
      "new-1",
    );
    expect(result).toEqual({
      ok: true,
      foods: [
        existingFood(),
        {
          id: "new-1",
          name: "Noma",
          isDefault: false,
          method: "pieces",
          perUnit: noma,
        },
      ],
    });
    expect(foods).toEqual([existingFood()]);
    expect(entry.foodName).toBe("Noma");
    expect(entry.nutrition.calories).toBe(800);
    expect(entry.oneOff).toBe(true);
  });

  it("rejects a whitespace name without appending", () => {
    const foods = [existingFood()];
    const result = appendPieceFoodFromOneOff(foods, oneOffEntry(), { name: "   ", nutrition: zeros }, "new-1");
    expect(result).toEqual({ ok: false, reason: "invalid", errors: ["name"] });
    expect(foods).toHaveLength(1);
  });

  it("appends all-zero nutrition when the name is present", () => {
    const result = appendPieceFoodFromOneOff(
      [],
      oneOffEntry(),
      { name: "Water", nutrition: zeros },
      "new-1",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.foods).toHaveLength(1);
    expect(result.foods[0]?.perUnit).toEqual(zeros);
  });

  it("rejects a library entry before validating the draft", () => {
    const foods = [existingFood()];
    const result = appendPieceFoodFromOneOff(foods, libraryEntry(), { name: "Cafe", nutrition: cafe }, "new-1");
    expect(result).toEqual({ ok: false, reason: "not-one-off" });
    expect(foods).toHaveLength(1);
  });

  it("appends again on a second id and does not merge a matching name", () => {
    const named = existingFood();
    named.name = "Noma";
    const first = appendPieceFoodFromOneOff([named], oneOffEntry(), { name: "Noma", nutrition: noma }, "new-1");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = appendPieceFoodFromOneOff(first.foods, oneOffEntry(), { name: "Noma", nutrition: cafe }, "new-2");
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.foods).toHaveLength(3);
    expect(second.foods[0]).toBe(named);
    expect(second.foods[0]?.perUnit).toEqual(cafe);
    expect(second.foods[1]?.id).toBe("new-1");
    expect(second.foods[2]?.id).toBe("new-2");
    expect(second.foods[2]?.perUnit).toEqual(cafe);
  });
});
