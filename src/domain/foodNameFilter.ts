import type { Food } from "./types";

export const normalizeFoodNameQuery = (query: string): string =>
  query.trim().toLocaleLowerCase();

export const foodNameMatches = (name: string, normalizedQuery: string): boolean => {
  if (normalizedQuery === "") return true;
  return name.toLocaleLowerCase().includes(normalizedQuery);
};

export const filterFoodsByName = (foods: Food[], query: string): Food[] => {
  const needle = normalizeFoodNameQuery(query);
  if (needle === "") return foods;
  return foods.filter((food) => foodNameMatches(food.name, needle));
};
