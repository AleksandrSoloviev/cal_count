import { describe, expect, it } from "vitest";
import {
  applyOneOffEdit,
  buildOneOffEntry,
  isOneOffEntry,
  validateOneOffDraft,
} from "../src/domain/oneOffEntry";
import type { Entry } from "../src/domain/types";

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
