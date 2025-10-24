import { computePrayerTimes } from "../src";
import { describe, it, expect } from "vitest";

describe("computePrayerTimes", () => {
  it("produces times for Jakarta with defaults", () => {
    const r = computePrayerTimes({
      date: { year: 2025, month: 10, day: 24 },
      latitude: -6.2,
      longitude: 106.8,
      tzOffset: 7,
    });
    expect(r.fajr).not.toBeNull();
    expect(r.isha).not.toBeNull();
    expect(r.meta.methodName).toBeTruthy();
  });
});
