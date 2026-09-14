import { describe, it, expect } from "vitest";
import {
  mapAssignmentDto,
  getRewardTypeLabel,
  getStatusInfo,
} from "@/lib/transformers/assignments";

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

  it("passes through title, description and tasks when present", () => {
    const dto = {
      id: 1,
      briefing: "Test",
      expiration: "2026-01-01",
      progress: [0],
      title: "MAJOR ORDER",
      description: "Short summary",
      tasks: [{ type: 3, values: [1, 2, 3], valueTypes: [1, 2, 3] }],
    };
    const result = mapAssignmentDto(dto);
    expect(result.title).toBe("MAJOR ORDER");
    expect(result.description).toBe("Short summary");
    expect(result.tasks).toHaveLength(1);
  });

  it("normalises absent title and description to null", () => {
    const result = mapAssignmentDto({
      id: 1,
      briefing: "Test",
      expiration: "2026-01-01",
      progress: [0],
    });
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
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
