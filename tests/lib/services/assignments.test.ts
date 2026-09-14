import { describe, it, expect, vi } from "vitest";
import {
  fetchAssignments,
  fetchAssignment,
} from "@/lib/services/assignments";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

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

describe("fetchAssignment", () => {
  const assignment = {
    id: 1,
    briefing: "Test",
    expiration: "2026-01-01",
    progress: [0],
  };

  it("requests the per-index endpoint", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: assignment });
    const result = await fetchAssignment(1);
    expect(result).toEqual(assignment);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.ASSIGNMENT(1).url,
      revalidate: ENDPOINTS.ASSIGNMENT(1).revalidate,
    });
  });

  it("throws on API failure with the index", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchAssignment(9)).rejects.toThrow(
      "Failed to fetch assignment 9",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [] });
    await expect(fetchAssignment(1)).rejects.toThrow(
      "Invalid assignment data",
    );
  });
});
