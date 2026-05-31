import { describe, it, expect } from "vitest";
import { mapAssignmentDto, getRewardTypeLabel, getStatusInfo } from "@/lib/transformers/assignments";

describe("mapAssignmentDto", () => {
  it("maps fields correctly", () => {
    const dto = {
      id: 1,
      briefing: "Test",
      expiration: "2026-01-01",
      progress: [0, 1],
      rewards: [{ type: 1, amount: 100 }],
    };
    const result = mapAssignmentDto(dto);
    expect(result.briefing).toBe("Test");
    expect(result.rewards).toEqual([{ type: 1, amount: 100 }]);
  });

  it("handles missing rewards", () => {
    const dto = {
      id: 1,
      briefing: "Test",
      expiration: "2026-01-01",
      progress: [0],
    };
    const result = mapAssignmentDto(dto);
    expect(result.rewards).toBeUndefined();
  });
});

describe("getRewardTypeLabel", () => {
  it("returns Medals for type 1", () => {
    expect(getRewardTypeLabel(1)).toBe("Medals");
  });
  it("returns Unknown for invalid type", () => {
    expect(getRewardTypeLabel(999)).toBe("Unknown Reward");
  });
});

describe("getStatusInfo", () => {
  it("returns EXPIRED for past date", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const info = getStatusInfo(past, 0);
    expect(info.text).toBe("EXPIRED");
  });
  it("returns COMPLETED for 100% progress", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const info = getStatusInfo(future, 100);
    expect(info.text).toBe("COMPLETED");
  });
  it("returns URGENT for less than 24h", () => {
    const soon = new Date(Date.now() + 3600000).toISOString();
    const info = getStatusInfo(soon, 50);
    expect(info.text).toBe("URGENT");
  });
  it("returns ACTIVE otherwise", () => {
    const future = new Date(Date.now() + 864000000).toISOString();
    const info = getStatusInfo(future, 50);
    expect(info.text).toBe("ACTIVE");
  });
});
