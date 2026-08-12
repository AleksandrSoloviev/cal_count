import { describe, expect, it } from "vitest";
import type { Entry, Food } from "../src/domain/types";
import { applyFoodUpdate } from "../src/domain/updateFood";
import { loadDocument, saveDocument } from "../src/storage/localStore";

const sampleFood = (overrides: Partial<Food> = {}): Food => ({
  id: "custom-1",
  name: "Yogurt",
  isDefault: false,
  method: "grams",
  perUnit: { calories: 59, protein: 10, fat: 0.4, carbs: 3.6 },
  ...overrides,
});

describe("applyFoodUpdate", () => {
  it("updates name and nutrients in place preserving id", () => {
    const foods = [sampleFood()];
    const next = applyFoodUpdate(foods, "custom-1", {
      name: "Greek yogurt",
      method: "grams",
      perUnit: { calories: 80, protein: 12, fat: 1, carbs: 4 },
    });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("custom-1");
    expect(next[0].name).toBe("Greek yogurt");
    expect(next[0].perUnit?.calories).toBe(80);
    expect(next[0].isDefault).toBe(false);
  });

  it("preserves isDefault for default foods", () => {
    const foods = [sampleFood({ id: "df-milk", name: "Milk", isDefault: true })];
    const next = applyFoodUpdate(foods, "df-milk", {
      name: "Oat milk",
      method: "milliliters",
      perUnit: { calories: 40, protein: 1, fat: 1.5, carbs: 5 },
    });
    expect(next[0].id).toBe("df-milk");
    expect(next[0].isDefault).toBe(true);
    expect(next[0].name).toBe("Oat milk");
  });

  it("no-ops on unknown id without appending", () => {
    const foods = [sampleFood()];
    const next = applyFoodUpdate(foods, "missing", {
      name: "Nope",
      method: "pieces",
      perUnit: { calories: 1, protein: 0, fat: 0, carbs: 0 },
    });
    expect(next).toBe(foods);
  });

  it("clears perUnit when switching to custom method", () => {
    const foods = [sampleFood()];
    const next = applyFoodUpdate(foods, "custom-1", {
      name: "Egg",
      method: "custom",
      components: [
        { id: "w", name: "White", decimals: false, nutrition: { calories: 17, protein: 3.6, fat: 0.1, carbs: 0.2 } },
      ],
    });
    expect(next[0].method).toBe("custom");
    expect(next[0].components).toHaveLength(1);
    expect(next[0].perUnit).toBeUndefined();
  });

  it("persist path updates foods only and leaves entry snapshots intact", () => {
    localStorage.clear();
    const entries: Entry[] = [
      {
        id: "e1",
        date: "2026-08-12",
        ts: 1,
        foodId: "custom-1",
        foodName: "Yogurt",
        method: "grams",
        qty: 100,
        nutrition: { calories: 59, protein: 10, fat: 0.4, carbs: 3.6 },
      },
    ];
    const entriesSnapshot = structuredClone(entries);
    saveDocument({
      version: 1,
      goals: { calories: 2000, protein: 150, fat: 65, carbs: 250 },
      foods: [sampleFood()],
      entries,
    });

    const doc = loadDocument();
    // Mirror useAppStore.updateFood: persist({ foods: next }) — entries omitted from the patch
    const nextFoods = applyFoodUpdate(doc.foods, "custom-1", {
      name: "Renamed",
      method: "grams",
      perUnit: { calories: 200, protein: 20, fat: 5, carbs: 10 },
    });
    saveDocument({ ...doc, foods: nextFoods });

    const again = loadDocument();
    expect(again.foods.find((f) => f.id === "custom-1")?.name).toBe("Renamed");
    expect(again.foods.find((f) => f.id === "custom-1")?.perUnit?.calories).toBe(200);
    expect(again.entries).toEqual(entriesSnapshot);
    expect(again.entries[0].foodName).toBe("Yogurt");
    expect(again.entries[0].nutrition.calories).toBe(59);
  });

  it("persists edited default through localStore without resetting seed", () => {
    localStorage.clear();
    const doc = loadDocument();
    const milk = doc.foods.find((f) => f.id === "df-milk");
    expect(milk?.isDefault).toBe(true);
    doc.foods = applyFoodUpdate(doc.foods, "df-milk", {
      name: "Skim milk",
      method: "milliliters",
      perUnit: { calories: 35, protein: 3.4, fat: 0.1, carbs: 5 },
    });
    saveDocument(doc);
    const again = loadDocument();
    const edited = again.foods.find((f) => f.id === "df-milk");
    expect(edited?.name).toBe("Skim milk");
    expect(edited?.isDefault).toBe(true);
    expect(edited?.perUnit?.calories).toBe(35);
  });
});
