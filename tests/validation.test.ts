import { describe, expect, it } from "vitest";
import {
  validateCompQty,
  validateGoals,
  validateSimpleQty,
  validateSurveyBody,
} from "../src/domain/validation";

describe("validation", () => {
  it("accepts valid goals", () => {
    const r = validateGoals({ calories: "2000", protein: "150", fat: "65", carbs: "250" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.goals.calories).toBe(2000);
  });

  it("rejects out of range calories", () => {
    const r = validateGoals({ calories: "100", protein: "10", fat: "10", carbs: "10" });
    expect(r.ok).toBe(false);
  });

  it("validates simple qty", () => {
    expect(validateSimpleQty("grams", "150").ok).toBe(true);
    expect(validateSimpleQty("grams", "0").ok).toBe(false);
    expect(validateSimpleQty("pieces", "101").ok).toBe(false);
  });

  it("requires a custom component qty", () => {
    expect(validateCompQty({ white: "0", yolk: "0" }).ok).toBe(false);
    expect(validateCompQty({ white: "2", yolk: "0" }).ok).toBe(true);
  });

  it("accepts valid survey body", () => {
    const r = validateSurveyBody({
      heightCm: "180",
      weightKg: "80",
      ageYears: "30",
      activity: "medium",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.heightCm).toBe(180);
      expect(r.weightKg).toBe(80);
      expect(r.ageYears).toBe(30);
      expect(r.activity).toBe("medium");
    }
  });

  it("rejects out-of-range survey body fields", () => {
    const r = validateSurveyBody({
      heightCm: "90",
      weightKg: "20",
      ageYears: "10",
      activity: null,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.heightCm).toBeTruthy();
      expect(r.errors.weightKg).toBeTruthy();
      expect(r.errors.ageYears).toBeTruthy();
      expect(r.errors.activity).toBeTruthy();
    }
  });

  it("rejects non-integer age", () => {
    const r = validateSurveyBody({
      heightCm: "180",
      weightKg: "80",
      ageYears: "30.5",
      activity: "low",
    });
    expect(r.ok).toBe(false);
  });
});
