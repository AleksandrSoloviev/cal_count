import { describe, expect, it } from "vitest";
import {
  dateOffset,
  fmtWeekRange,
  greetingForHour,
  todayStr,
  weekBoundsSatFri,
} from "../src/domain/dates";

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

  it("weekBoundsSatFri: Saturday starts the week", () => {
    expect(weekBoundsSatFri("2026-08-15")).toEqual({
      start: "2026-08-15",
      end: "2026-08-21",
    });
  });

  it("weekBoundsSatFri: Sunday is still that Saturday–Friday", () => {
    expect(weekBoundsSatFri("2026-08-16")).toEqual({
      start: "2026-08-15",
      end: "2026-08-21",
    });
  });

  it("weekBoundsSatFri: Friday is inclusive end", () => {
    expect(weekBoundsSatFri("2026-08-21")).toEqual({
      start: "2026-08-15",
      end: "2026-08-21",
    });
  });

  it("weekBoundsSatFri: next Saturday opens a new week", () => {
    expect(weekBoundsSatFri("2026-08-22")).toEqual({
      start: "2026-08-22",
      end: "2026-08-28",
    });
  });

  it("fmtWeekRange uses short weekday + month + day on both ends", () => {
    const label = fmtWeekRange("2026-08-15", "2026-08-21");
    expect(label).toMatch(/^Sat Aug 15 – Fri Aug 21$/);
  });
});
