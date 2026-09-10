import { describe, expect, it } from "vitest";
import { dumpFilename, serializeDump } from "../src/storage/dump";
import type { StorageDocument } from "../src/storage/schema";

const sampleDoc = (): StorageDocument => ({
  version: 1,
  goals: { calories: 2000, protein: 150, fat: 65, carbs: 250 },
  foods: [
    {
      id: "food-1",
      name: "Egg",
      isDefault: true,
      method: "pieces",
      perUnit: { calories: 78, protein: 6.3, fat: 5.3, carbs: 0.6 },
    },
  ],
  entries: [
    {
      id: "entry-1",
      date: "2026-09-10",
      ts: 1_757_520_000_000,
      foodId: "food-1",
      foodName: "Egg",
      method: "pieces",
      qty: 2,
      nutrition: { calories: 156, protein: 12.6, fat: 10.6, carbs: 1.2 },
    },
  ],
});

describe("dump", () => {
  it("names the file with the local calendar date", () => {
    expect(dumpFilename(new Date("2026-09-10T15:00:00"))).toBe("cal_count-2026-09-10.json");
  });

  it("serializes the full storage document as pretty JSON", () => {
    const json = serializeDump(sampleDoc());
    const parsed = JSON.parse(json) as StorageDocument;
    expect(parsed.version).toBe(1);
    expect(parsed.goals?.calories).toBe(2000);
    expect(parsed.foods).toHaveLength(1);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0]?.foodName).toBe("Egg");
    expect(json.startsWith("{")).toBe(true);
    expect(json).toContain("\n  \"version\":");
  });
});
