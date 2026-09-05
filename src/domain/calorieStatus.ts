import type { CalorieCardStatus } from "./types";

export const calorieCardStatus = (
  actualCalories: number,
  goalCalories: number,
): CalorieCardStatus => {
  const actual = Math.round(actualCalories);
  const goal = Math.round(goalCalories);
  if (actual > goal) return "red";
  if (goal - actual > 150) return "yellow";
  return "green";
};
