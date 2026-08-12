import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../src/storage/keys";
import { loadDocument, migrate, saveDocument } from "../src/storage/localStore";

describe("localStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when empty", () => {
    const doc = loadDocument();
    expect(doc.goals).toBeNull();
    expect(doc.entries).toEqual([]);
    expect(doc.foods.length).toBeGreaterThan(0);
  });

  it("round-trips save/load", () => {
    const doc = loadDocument();
    doc.goals = { calories: 2000, protein: 150, fat: 65, carbs: 250 };
    saveDocument(doc);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    const again = loadDocument();
    expect(again.goals?.calories).toBe(2000);
  });

  it("migrates corrupt to safe shape via migrate", () => {
    const migrated = migrate({ version: 0, goals: null, foods: [], entries: [] });
    expect(migrated.foods.length).toBeGreaterThan(0);
    expect(migrated.version).toBe(1);
  });

  it("recovers from corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    const doc = loadDocument();
    expect(doc.goals).toBeNull();
    expect(doc.foods.length).toBeGreaterThan(0);
  });
});
