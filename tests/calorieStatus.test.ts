import { describe, expect, it } from "vitest";
import { calorieCardStatus } from "../src/domain/calorieStatus";

describe("calorieCardStatus", () => {
  it("is red when actual exceeds goal by any whole kcal", () => {
    expect(calorieCardStatus(2001, 2000)).toBe("red");
  });

  it("is green on exact match", () => {
    expect(calorieCardStatus(2000, 2000)).toBe("green");
  });

  it("is green when shortfall is at most 150 kcal", () => {
    expect(calorieCardStatus(1850, 2000)).toBe("green");
  });

  it("is yellow when shortfall is more than 150 kcal", () => {
    expect(calorieCardStatus(1849, 2000)).toBe("yellow");
  });

  it("is yellow when actual is 0 against a 2000 goal", () => {
    expect(calorieCardStatus(0, 2000)).toBe("yellow");
  });

  it("rounds before comparing", () => {
    expect(calorieCardStatus(2000.4, 2000)).toBe("green");
    expect(calorieCardStatus(2000.6, 2000)).toBe("red");
  });
});
