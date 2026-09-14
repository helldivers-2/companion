import { describe, it, expect, vi } from "vitest";
import { getAssignments, getAssignment } from "@/lib/data/assignments";
import {
  fetchAssignments,
  fetchAssignment,
} from "@/lib/services/assignments";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/assignments", () => ({
  fetchAssignments: vi.fn(),
  fetchAssignment: vi.fn(),
}));

describe("getAssignments", () => {
  it("returns mapped assignments", async () => {
    const mock = [
      { id: 1, briefing: "Test", expiration: "2026-01-01", progress: [0] },
    ];
    vi.mocked(fetchAssignments).mockResolvedValue(mock);

    const result = await getAssignments();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result).toHaveLength(1);
    expect(result[0].briefing).toBe("Test");
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchAssignments).mockRejectedValue(new Error("fail"));
    const result = await getAssignments();
    expect(result).toBeNull();
  });
});

describe("getAssignment", () => {
  it("maps a single assignment", async () => {
    vi.mocked(fetchAssignment).mockResolvedValue({
      id: 1,
      briefing: "Test",
      expiration: "2026-01-01",
      progress: [0],
    });

    const result = await getAssignment(1);
    if (result === null) throw new Error("Expected result");
    expect(result.briefing).toBe("Test");
    expect(fetchAssignment).toHaveBeenCalledWith(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchAssignment).mockRejectedValue(new Error("fail"));
    expect(await getAssignment(1)).toBeNull();
  });
});
