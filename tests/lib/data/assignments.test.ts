import { describe, it, expect, vi } from "vitest";
import { getAssignments } from "@/lib/data/assignments";
import { fetchAssignments } from "@/lib/services/assignments";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/assignments", () => ({
  fetchAssignments: vi.fn(),
}));

describe("getAssignments", () => {
  it("returns mapped assignments", async () => {
    const mock = [{ id: 1, briefing: "Test", expiration: "2026-01-01", progress: [0] }];
    vi.mocked(fetchAssignments).mockResolvedValue(mock);

    const result = await getAssignments();
    expect(result).toHaveLength(1);
    expect(result[0].briefing).toBe("Test");
  });

  it("returns empty array on failure", async () => {
    vi.mocked(fetchAssignments).mockRejectedValue(new Error("fail"));
    const result = await getAssignments();
    expect(result).toEqual([]);
  });
});
