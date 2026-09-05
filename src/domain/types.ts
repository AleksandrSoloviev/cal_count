export type NutrientKey = "calories" | "protein" | "fat" | "carbs";

export interface Goals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Nutrient {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type Method = "grams" | "milliliters" | "pieces" | "custom";

export interface FoodComponent {
  id: string;
  name: string;
  decimals: boolean;
  nutrition: Nutrient;
}

export interface Food {
  id: string;
  name: string;
  isDefault: boolean;
  method: Method;
  perUnit?: Nutrient;
  components?: FoodComponent[];
  lastUsed?: number;
}

export interface Entry {
  id: string;
  date: string;
  ts: number;
  foodId: string;
  foodName: string;
  method: Method;
  qty?: number;
  compQty?: Record<string, number>;
  nutrition: Nutrient;
}

/** Derived cluster for one calendar day. Not persisted. */
export type Meal = {
  index: number;
  entries: Entry[];
  nutrition: Nutrient;
  startTs: number;
  endTs: number;
};

/** Session UI focus after add/edit/delete. Not persisted. */
export type EntryFocus =
  | { kind: "entry"; id: string }
  | { kind: "remaining"; ids: string[] }
  | { kind: "latest" };

/** Session UI for Today progress card. Not persisted. */
export type CardMode = "day" | "week";

/** Session UI for History Daily / Weekly. Not persisted. Independent of CardMode. */
export type HistoryPeriod = "daily" | "weekly";

/** Derived calorie strip on History compare cards. Not persisted. */
export type CalorieCardStatus = "red" | "yellow" | "green";

/** Derived Saturday–Friday window. Not persisted. */
export type WeekWindow = {
  start: string;
  end: string;
};

export type SurveySex = "man" | "woman" | "preferNotToSay";

export type ActivityLevel = "low" | "medium" | "high";

export type GoalType = "lose" | "maintain" | "gain";

export type SurveyAnswers = {
  sex: SurveySex;
  heightCm: number;
  weightKg: number;
  ageYears: number;
  activity: ActivityLevel;
  goalType: GoalType;
};

export type Tab = "home" | "fridge" | "history" | "stats";

export type Modal =
  | { type: "log-food"; food: Food }
  | { type: "add-food"; prefill?: Food }
  | { type: "edit-food"; food: Food }
  | { type: "day-detail"; date: string }
  | { type: "move-meal"; entryIds: string[]; sourceDate: string };
