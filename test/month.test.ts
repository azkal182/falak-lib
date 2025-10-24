import { describe, it, expect } from "vitest";
import { computeMonthSchedule } from "../src";

describe("computeMonthSchedule", () => {
  it("generates correct number of days for November 2025", () => {
    const r = computeMonthSchedule({
      year: 2025,
      month: 11,
      latitude: -6.2,
      longitude: 106.8,
      tzOffset: 7,
      method: "KemenagRI",
    });
    expect(r.rows.length).toBe(30); // Nov 2025 = 30 hari
    expect(r.rows[0].fajr).not.toBeNull();
    expect(r.rows[29].isha).not.toBeNull();
  });
});
