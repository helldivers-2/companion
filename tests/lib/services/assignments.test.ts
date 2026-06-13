import { describe, it, expect, vi } from "vitest";
import { fetchAssignments } from "@/lib/services/assignments";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchAssignments", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      { id: 1, briefing: "Test", expiration: "2026-01-01", progress: [0] },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchAssignments();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchAssignments()).rejects.toThrow(
      "Failed to fetch assignments",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchAssignments()).rejects.toThrow(
      "Invalid assignments data",
    );
  });
});
