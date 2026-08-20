import type { Entry, Food } from "./types";

export const countFoodUsage = (entries: Entry[]): Map<string, number> => {
  const usage = new Map<string, number>();
  for (const entry of entries) {
    usage.set(entry.foodId, (usage.get(entry.foodId) ?? 0) + 1);
  }
  return usage;
};

export const compareFoodsByPopularity = (
  a: Food,
  b: Food,
  usage: Map<string, number>,
): number => {
  const byUsage = (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0);
  if (byUsage !== 0) return byUsage;

  const byLastUsed = (b.lastUsed ?? 0) - (a.lastUsed ?? 0);
  if (byLastUsed !== 0) return byLastUsed;

  const byName = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  if (byName !== 0) return byName;

  return a.id.localeCompare(b.id);
};

export const sortFoodsByPopularity = (foods: Food[], entries: Entry[]): Food[] => {
  const usage = countFoodUsage(entries);
  return [...foods].sort((a, b) => compareFoodsByPopularity(a, b, usage));
};
