import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getSuperEarthNews } from "@/lib/data/war-metadata";
import SuperEarthNews from "@/components/widgets/news/super-earth-news";

vi.mock("@/lib/data/war-metadata", () => ({
  getSuperEarthNews: vi.fn(),
}));

describe("SuperEarthNews", () => {
  it("renders an error state when the feed fails to load", async () => {
    vi.mocked(getSuperEarthNews).mockResolvedValue(null);

    const html = renderToStaticMarkup(await SuperEarthNews());
    expect(html).toContain("Unable to load the Super Earth broadcast");
  });

  it("renders an empty state", async () => {
    vi.mocked(getSuperEarthNews).mockResolvedValue([]);

    const html = renderToStaticMarkup(await SuperEarthNews());
    expect(html).toContain("No broadcasts");
  });

  it("renders the newest broadcasts", async () => {
    vi.mocked(getSuperEarthNews).mockResolvedValue([
      {
        id: 1,
        published: "2026-01-23T20:05:13.000Z",
        type: 0,
        message: "Citizens, the war continues.",
      },
    ]);

    const html = renderToStaticMarkup(await SuperEarthNews());
    expect(html).toContain("Citizens, the war continues.");
  });
});
