import { describe, it, expect, vi } from "vitest";
import { getPatchNotes } from "@/lib/data/news";
import { fetchPatchNotes } from "@/lib/services/news";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/news", () => ({
  fetchPatchNotes: vi.fn(),
}));

describe("getPatchNotes", () => {
  it("returns mapped patch notes", async () => {
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
    vi.mocked(fetchPatchNotes).mockResolvedValue(mock);

    const result = await getPatchNotes();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Patch");
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchPatchNotes).mockRejectedValue(new Error("fail"));
    const result = await getPatchNotes();
    expect(result).toBeNull();
  });
});
