import { describe, it, expect, vi } from "vitest";
import { fetchPatchNotes, fetchPatchNote } from "@/lib/services/news";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchPatchNotes", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      {
        id: "1",
        title: "Patch",
        url: "http://example.com",
        author: "Dev",
        content: "Fixes",
        publishedAt: "2026-01-01",
      },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchPatchNotes();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPatchNotes()).rejects.toThrow(
      "Failed to fetch patch notes",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchPatchNotes()).rejects.toThrow("Invalid patch notes data");
  });
});

describe("fetchPatchNote", () => {
  const item = {
    id: "123",
    title: "Patch",
    url: "http://example.com",
    author: "Dev",
    content: "Fixes",
    publishedAt: "2026-01-01",
  };

  it("requests the gid endpoint and unwraps the single item", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [item] });

    const result = await fetchPatchNote("123");
    expect(result).toEqual(item);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.STEAM_ITEM("123").url,
      revalidate: ENDPOINTS.STEAM_ITEM("123").revalidate,
    });
  });

  it("accepts the item as a bare object", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: item });
    expect(await fetchPatchNote("123")).toEqual(item);
  });

  it("returns null when the API reports an unknown gid", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("404"),
    });
    expect(await fetchPatchNote("nope")).toBeNull();
  });

  it("returns null for an empty response array", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [] });
    expect(await fetchPatchNote("123")).toBeNull();
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "nope" });
    await expect(fetchPatchNote("123")).rejects.toThrow(
      "Invalid patch note data",
    );
  });
});
