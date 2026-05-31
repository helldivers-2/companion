import { describe, it, expect, vi } from "vitest";
import { fetchPatchNotes } from "@/lib/services/news";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchPatchNotes", () => {
  it("returns DTOs on success", async () => {
    const mock = [{ id: "1", title: "Patch", url: "http://example.com", author: "Dev", content: "Fixes", publishedAt: "2026-01-01" }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchPatchNotes();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPatchNotes()).rejects.toThrow("Failed to fetch patch notes");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchPatchNotes()).rejects.toThrow("Invalid patch notes data");
  });
});
