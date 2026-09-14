import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPatchNote } from "@/lib/data/news";
import ArticlePage from "@/app/news/[gid]/page";

vi.mock("@/lib/data/news", () => ({
  getPatchNote: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const note = {
  id: "123",
  title: "Patch 1.2",
  url: "https://store.steampowered.com/news/app/553850",
  author: "Arrowhead",
  content: "[h1]Balance[/h1]\n[b]Buff[/b] everything.",
  publishedAt: "2026-01-01T00:00:00Z",
};

describe("ArticlePage", () => {
  it("rejects an unknown gid", async () => {
    vi.mocked(getPatchNote).mockResolvedValue(null);
    await expect(
      ArticlePage({ params: Promise.resolve({ gid: "nope" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the article body", async () => {
    vi.mocked(getPatchNote).mockResolvedValue(note);

    const html = renderToStaticMarkup(
      await ArticlePage({ params: Promise.resolve({ gid: "123" }) }),
    );
    expect(html).toContain("Patch 1.2");
    expect(html).toContain("Balance");
    expect(html).toContain("everything.");
  });
});
