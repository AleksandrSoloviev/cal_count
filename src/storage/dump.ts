import type { Entry, Food, Goals, Method, Nutrient } from "../domain/types";
import { todayStr } from "../domain/dates";
import { SCHEMA_VERSION } from "./keys";
import { migrate } from "./localStore";
import type { StorageDocument } from "./schema";

export const dumpFilename = (now = new Date()): string => `cal_count-${todayStr(now)}.json`;

export const serializeDump = (doc: StorageDocument): string =>
  `${JSON.stringify({ ...doc, version: SCHEMA_VERSION }, null, 2)}\n`;

export type ParseDumpResult =
  | { ok: true; doc: StorageDocument }
  | { ok: false; reason: "invalid-json" | "invalid-shape" };

const METHODS: ReadonlySet<string> = new Set(["grams", "milliliters", "pieces", "custom"]);

const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

const isNutrient = (v: unknown): v is Nutrient => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    isFiniteNumber(o.calories) &&
    isFiniteNumber(o.protein) &&
    isFiniteNumber(o.fat) &&
    isFiniteNumber(o.carbs)
  );
};

const isMethod = (v: unknown): v is Method => typeof v === "string" && METHODS.has(v);

const isFood = (v: unknown): v is Food => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.name === "string" &&
    typeof o.isDefault === "boolean" &&
    isMethod(o.method)
  );
};

const isEntry = (v: unknown): v is Entry => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.date === "string" &&
    isFiniteNumber(o.ts) &&
    typeof o.foodId === "string" &&
    typeof o.foodName === "string" &&
    isMethod(o.method) &&
    isNutrient(o.nutrition)
  );
};

export const parseDump = (raw: string): ParseDumpResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid-shape" };
  }
  const rec = parsed as Record<string, unknown>;
  if (!("goals" in rec) || !("foods" in rec) || !("entries" in rec)) {
    return { ok: false, reason: "invalid-shape" };
  }
  if (rec.goals !== null && !isNutrient(rec.goals)) {
    return { ok: false, reason: "invalid-shape" };
  }
  if (!Array.isArray(rec.foods) || !rec.foods.every(isFood)) {
    return { ok: false, reason: "invalid-shape" };
  }
  if (!Array.isArray(rec.entries) || !rec.entries.every(isEntry)) {
    return { ok: false, reason: "invalid-shape" };
  }
  const version = typeof rec.version === "number" && Number.isFinite(rec.version) ? rec.version : 0;
  return {
    ok: true,
    doc: migrate({
      version,
      goals: rec.goals === null ? null : (rec.goals as Goals),
      foods: rec.foods as Food[],
      entries: rec.entries as Entry[],
    }),
  };
};
