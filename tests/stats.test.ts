import { describe, expect, it } from "vitest";
import {
  buildStatsBuckets,
  statsBarOverflows,
  statsFullBucketGoal,
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

describe("buildStatsBuckets", () => {
  it("7d day excludes dates 8+ days ago", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-03", 200)],
      today,
      period: "7d",
      granularity: "day",
    });
    expect(buckets.map((b) => b.key)).toEqual(["2026-09-11"]);
  });

  it("30d day includes older dates in window, oldest first", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-03", 200)],
      today,
      period: "30d",
      granularity: "day",
    });
    expect(buckets.map((b) => b.key)).toEqual(["2026-09-03", "2026-09-11"]);
  });

  it("7d week includes the in-progress Sat–Fri week only", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("fri", "2026-09-11", 100), entry("thu", "2026-09-03", 200)],
      today,
      period: "7d",
      granularity: "week",
    });
    expect(buckets).toHaveLength(1);
    expect(buckets[0].rangeStart).toBe("2026-09-05");
    expect(buckets[0].rangeEnd).toBe("2026-09-11");
  });

  it("30d week lists two weeks, older first, including in-progress", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("fri", "2026-09-11", 100), entry("thu", "2026-09-03", 200)],
      today,
      period: "30d",
      granularity: "week",
    });
    expect(buckets.map((b) => b.rangeStart)).toEqual(["2026-08-29", "2026-09-05"]);
  });

  it("7d month clips current month through the 7-day window", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 400)],
      today,
      period: "7d",
      granularity: "month",
    });
    expect(buckets).toHaveLength(1);
    expect(buckets[0].key).toBe("2026-09");
    expect(buckets[0].clipStart).toBe("2026-09-05");
    expect(buckets[0].clipEnd).toBe("2026-09-11");
    expect(buckets[0].intersectionDays).toBe(7);
    expect(buckets[0].totals.calories).toBe(400);
  });

  it("returns empty when the lookback has no entries", () => {
    expect(
      buildStatsBuckets({
        entries: [entry("a", "2026-08-01", 100)],
        today,
        period: "7d",
        granularity: "day",
      }),
    ).toEqual([]);
  });

  it("12m month keeps August and omits empty current September", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-08-01", 100)],
      today,
      period: "12m",
      granularity: "month",
    });
    expect(buckets.map((b) => b.key)).toEqual(["2026-08"]);
  });

  it("sums two entries on the same date into one day bar", () => {
    const buckets = buildStatsBuckets({
      entries: [entry("a", "2026-09-11", 100), entry("b", "2026-09-11", 50)],
      today,
      period: "7d",
      granularity: "day",
    });
    expect(buckets).toHaveLength(1);
    expect(buckets[0].totals.calories).toBe(150);
  });

  it("7d day keys match sparse last-7 dates including today", () => {
    const entries = [
      entry("a", "2026-09-11", 1),
      entry("b", "2026-09-10", 1),
      entry("c", "2026-09-05", 1),
      entry("d", "2026-09-04", 1),
    ];
    const keys = buildStatsBuckets({
      entries,
      today,
      period: "7d",
      granularity: "day",
    }).map((b) => b.key);
    expect(keys).toEqual(["2026-09-05", "2026-09-10", "2026-09-11"]);
  });
});

describe("statsFullBucketGoal / statsBarOverflows", () => {
  it("scales the tile goal by granularity", () => {
    expect(statsFullBucketGoal("day", 2000, today)).toBe(2000);
    expect(statsFullBucketGoal("week", 2000, today)).toBe(14000);
    expect(statsFullBucketGoal("month", 2000, today)).toBe(60000);
  });

  it("overflows when the displayed bar exceeds intersection-scaled goal", () => {
    expect(statsBarOverflows(2001, 2000, 1)).toBe(true);
    expect(statsBarOverflows(2000, 2000, 1)).toBe(false);
    expect(statsBarOverflows(6001, 2000, 3)).toBe(true);
    expect(statsBarOverflows(5999, 2000, 3)).toBe(false);
  });
});
