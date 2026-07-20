import { describe, it, expect } from "vitest";
import { formatTimeRemaining } from "@/lib/utils";

describe("formatTimeRemaining", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns 'Ended' once the deadline has passed", () => {
    expect(formatTimeRemaining("2025-12-31T23:59:00Z", now)).toBe("Ended");
  });

  it("formats sub-day remaining as hours and minutes", () => {
    expect(formatTimeRemaining("2026-01-01T02:30:00Z", now)).toBe("2h 30m");
  });

  it("formats multi-day remaining as days and hours", () => {
    expect(formatTimeRemaining("2026-01-03T03:00:00Z", now)).toBe("2d 3h");
  });
});
