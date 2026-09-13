import { describe, expect, it } from "vitest";
import { r1 } from "../src/domain/nutrition";
import {
  buildStatsBuckets,
  grainForPeriod,
  statsAverageLogged,
  statsDailyEquivalent,
  statsPointOverflows,
  statsTickIndices,
  statsYDomainMax,
} from "../src/domain/stats";
import type { Entry, Nutrient } from "../src/domain/types";

const nutrient = (calories: number, protein = 0, fat = 0, carbs = 0): Nutrient => ({
  calories,
  protein,
  fat,
  carbs,
});

const entry = (id: string, date: string, cal: number): Entry => ({
  id,
  date,
  ts: Date.parse(`${date}T12:00:00`),
  foodId: "f1",
  foodName: "Food",
  method: "grams",
  qty: 100,
  nutrition: nutrient(cal),
});

const today = "2026-09-11";

describe("grainForPeriod", () => {
  it("locks grain to period", () => {
    expect(grainForPeriod("7d")).toBe("day");
    expect(grainForPeriod("30d")).toBe("day");
    expect(grainForPeriod("90d")).toBe("week");
    expect(grainForPeriod("12m")).toBe("month");
  });
});

describe("buildStatsBuckets", () => {
  it("returns empty when the lookback has no entries", () => {
    expect(
      buildStatsBuckets({
        entries: [entry("a", "2026-08-01", 100)],
        today,
        period: "7d",
      }),
    ).toEqual([]);
  });

  it("7d emits 7 day slots with zeros for holes", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-03", 200)],
      today,
      period: "7d",
    });
    expect(buckets.map((b) => b.key)).toEqual([
      "2026-09-05",
      "2026-09-06",
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
    ]);
    expect(buckets.filter((b) => b.hasEntries).map((b) => b.key)).toEqual(["2026-09-11"]);
    expect(buckets.find((b) => b.key === "2026-09-05")?.totals.calories).toBe(0);
  });

  it("30d emits 30 day slots including unlogged dates", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-03", 200)],
      today,
      period: "30d",
    });
    expect(buckets).toHaveLength(30);
    expect(buckets[0].key).toBe("2026-08-13");
    expect(buckets[29].key).toBe("2026-09-11");
    expect(buckets.filter((b) => b.hasEntries).map((b) => b.key)).toEqual(["2026-09-03", "2026-09-11"]);
  });

  it("90d includes every intersecting Sat–Fri week and the in-progress week", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("fri", "2026-09-11", 100)],
      today,
      period: "90d",
    });
    expect(buckets[0].rangeStart).toBe("2026-06-13");
    expect(buckets[buckets.length - 1].rangeStart).toBe("2026-09-05");
    expect(buckets[buckets.length - 1].rangeEnd).toBe("2026-09-11");
    expect(buckets).toHaveLength(13);
    expect(buckets.filter((b) => b.hasEntries)).toHaveLength(1);
  });

  it("12m emits 12 months including empty current September", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-08-01", 100)],
      today,
      period: "12m",
    });
    expect(buckets.map((b) => b.key)).toEqual([
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
    ]);
    expect(buckets.find((b) => b.key === "2026-08")?.hasEntries).toBe(true);
    expect(buckets.find((b) => b.key === "2026-09")?.hasEntries).toBe(false);
  });

  it("sums two entries on the same date into one day slot", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-11", 50)],
      today,
      period: "7d",
    });
    expect(buckets).toHaveLength(7);
    expect(buckets[6].totals.calories).toBe(150);
    expect(buckets[6].hasEntries).toBe(true);
  });
});

describe("daily equivalent / average / overflow / domain / ticks", () => {
  it("statsDailyEquivalent divides by intersection days", () => {
    expect(statsDailyEquivalent(400, 1)).toBe(400);
    expect(statsDailyEquivalent(400, 4)).toBe(100);
  });

  it("statsAverageLogged ignores empty slots", () => {
    const buckets = buildStatsBuckets({
      entries: [
        entry("a", "2026-09-05", 100),
        entry("b", "2026-09-08", 200),
        entry("c", "2026-09-11", 300),
      ],
      today,
      period: "7d",
    });
    expect(statsAverageLogged(buckets, "calories")).toBe(200);
  });

  it("statsPointOverflows compares displayed daily equivalent to the daily goal", () => {
    expect(statsPointOverflows(2001, 2000)).toBe(true);
    expect(statsPointOverflows(2000, 2000)).toBe(false);
    expect(statsPointOverflows(r1(6001 / 3), 2000)).toBe(true);
  });

  it("statsYDomainMax includes the goal with 10% headroom", () => {
    expect(statsYDomainMax([89], 2000)).toBe(2200);
  });

  it("statsTickIndices keeps all 7d ticks and 4–6 on longer series", () => {
    expect(statsTickIndices(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    const thirty = statsTickIndices(30);
    expect(thirty[0]).toBe(0);
    expect(thirty[thirty.length - 1]).toBe(29);
    expect(thirty.length).toBeGreaterThanOrEqual(4);
    expect(thirty.length).toBeLessThanOrEqual(6);
    const twelve = statsTickIndices(12);
    expect(twelve[0]).toBe(0);
    expect(twelve[twelve.length - 1]).toBe(11);
    expect(twelve.length).toBeGreaterThanOrEqual(4);
    expect(twelve.length).toBeLessThanOrEqual(6);
  });
});
