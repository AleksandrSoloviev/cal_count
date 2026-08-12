import type { ActivityLevel, GoalType, Goals, SurveyAnswers, SurveySex } from "./types";

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  low: 1.2,
  medium: 1.55,
  high: 1.725,
};

const GOAL_CALORIE_MULT: Record<GoalType, number> = {
  lose: 0.85,
  maintain: 1,
  gain: 1.1,
};

const PROTEIN_G_PER_KG: Record<GoalType, number> = {
  lose: 1.8,
  maintain: 1.6,
  gain: 2,
};

const bmrForSex = (
  sex: Exclude<SurveySex, "preferNotToSay">,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "man" ? base + 5 : base - 161;
};

export const calculateBmr = (
  sex: SurveySex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number => {
  if (sex === "preferNotToSay") {
    return (
      (bmrForSex("man", weightKg, heightCm, ageYears) +
        bmrForSex("woman", weightKg, heightCm, ageYears)) /
      2
    );
  }
  return bmrForSex(sex, weightKg, heightCm, ageYears);
};

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

export const calculateGoalsFromSurvey = (answers: SurveyAnswers): Goals => {
  const bmr = calculateBmr(answers.sex, answers.weightKg, answers.heightCm, answers.ageYears);
  const tdee = bmr * ACTIVITY_FACTOR[answers.activity];
  let calories = Math.round(tdee * GOAL_CALORIE_MULT[answers.goalType]);
  calories = clamp(calories, 500, 10000);

  let protein = Math.round(PROTEIN_G_PER_KG[answers.goalType] * answers.weightKg);
  let fat = Math.round((calories * 0.25) / 9);
  let carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  protein = clamp(protein, 0, 1000);
  fat = clamp(fat, 0, 1000);
  carbs = clamp(carbs, 0, 1000);

  return { calories, protein, fat, carbs };
};
