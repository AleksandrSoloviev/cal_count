import { describe, expect, it } from "vitest";
import {
  addDays,
  countInclusiveDays,
  dateOffset,
  daysInCalendarMonth,
  fmtWeekRange,
  greetingForHour,
  monthBounds,
  shiftTsToDate,
  statsLookback,
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

  it("shiftTsToDate keeps local clock time on the target date", () => {
    const ts = new Date(2026, 7, 13, 18, 30, 15, 250).getTime();
    const shifted = shiftTsToDate(ts, "2026-08-10");
    const d = new Date(shifted);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(18);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(15);
    expect(d.getMilliseconds()).toBe(250);
  });

  it("addDays moves local calendar dates", () => {
    expect(addDays("2026-09-11", -6)).toBe("2026-09-05");
    expect(addDays("2026-09-11", -29)).toBe("2026-08-13");
  });

  it("statsLookback fixtures for 2026-09-11", () => {
    const today = "2026-09-11";
    expect(statsLookback("7d", today)).toEqual({ start: "2026-09-05", end: today });
    expect(statsLookback("30d", today)).toEqual({ start: "2026-08-13", end: today });
    expect(statsLookback("90d", today)).toEqual({ start: "2026-06-14", end: today });
    expect(statsLookback("12m", today)).toEqual({ start: "2025-10-01", end: today });
  });

  it("statsLookback 12m starts on the 1st after a long month", () => {
    expect(statsLookback("12m", "2026-03-31").start).toBe("2025-04-01");
  });

  it("daysInCalendarMonth / countInclusiveDays / monthBounds", () => {
    expect(daysInCalendarMonth("2026-09-11")).toBe(30);
    expect(daysInCalendarMonth("2026-02-01")).toBe(28);
    expect(countInclusiveDays("2026-09-05", "2026-09-11")).toBe(7);
    expect(countInclusiveDays("2026-09-01", "2026-09-11")).toBe(11);
    expect(monthBounds("2026-09-11")).toEqual({ start: "2026-09-01", end: "2026-09-30" });
  });
});
