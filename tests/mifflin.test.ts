import { describe, expect, it } from "vitest";
import { calculateBmr, calculateGoalsFromSurvey } from "../src/domain/mifflin";
import type { SurveyAnswers } from "../src/domain/types";

const golden: SurveyAnswers = {
  sex: "man",
  heightCm: 180,
  weightKg: 80,
  ageYears: 30,
  activity: "medium",
  goalType: "maintain",
};

describe("mifflin / calculateGoalsFromSurvey", () => {
  it("matches the golden fixture (man / 180 / 80 / 30 / medium / maintain)", () => {
    expect(calculateGoalsFromSurvey(golden)).toEqual({
      calories: 2759,
      protein: 128,
      fat: 77,
      carbs: 389,
    });
  });

  it("averages male and female BMR for preferNotToSay", () => {
    const man = calculateBmr("man", 80, 180, 30);
    const woman = calculateBmr("woman", 80, 180, 30);
    expect(calculateBmr("preferNotToSay", 80, 180, 30)).toBe((man + woman) / 2);
  });

  it("applies lose (−15%) and gain (+10%) calorie multipliers", () => {
    const maintain = calculateGoalsFromSurvey(golden).calories;
    const lose = calculateGoalsFromSurvey({ ...golden, goalType: "lose" }).calories;
    const gain = calculateGoalsFromSurvey({ ...golden, goalType: "gain" }).calories;
    expect(lose).toBe(Math.round(2759 * 0.85));
    expect(gain).toBe(Math.round(2759 * 1.1));
    expect(lose).toBeLessThan(maintain);
    expect(gain).toBeGreaterThan(maintain);
  });

  it("clamps extreme calories into 500–10000", () => {
    const tiny = calculateGoalsFromSurvey({
      sex: "woman",
      heightCm: 100,
      weightKg: 30,
      ageYears: 100,
      activity: "low",
      goalType: "lose",
    });
    expect(tiny.calories).toBeGreaterThanOrEqual(500);
    expect(tiny.calories).toBeLessThanOrEqual(10000);
    expect(tiny.protein).toBeGreaterThanOrEqual(0);
    expect(tiny.protein).toBeLessThanOrEqual(1000);
  });
});
