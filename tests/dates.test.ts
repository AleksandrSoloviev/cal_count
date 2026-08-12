import { describe, expect, it } from "vitest";
import { dateOffset, greetingForHour, todayStr } from "../src/domain/dates";

describe("dates", () => {
  it("formats today as YYYY-MM-DD", () => {
    expect(todayStr(new Date("2026-08-12T15:00:00"))).toBe("2026-08-12");
  });

  it("offsets days", () => {
    expect(dateOffset(1, new Date("2026-08-12T12:00:00"))).toBe("2026-08-11");
  });

  it("greeting buckets", () => {
    expect(greetingForHour(8)).toBe("morning");
    expect(greetingForHour(14)).toBe("afternoon");
    expect(greetingForHour(20)).toBe("evening");
  });
});
