import { describe, it, expect, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { getPlanets } from "@/lib/data/planets";
import { siteConfig } from "@/config/site";

vi.mock("@/lib/data/planets", () => ({
  getPlanets: vi.fn(),
}));

describe("sitemap", () => {
  it("returns only the home page when planets fail to load", async () => {
    vi.mocked(getPlanets).mockResolvedValue(null);

    const entries = await sitemap();
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(siteConfig.url);
  });

  it("adds a URL per indexed planet", async () => {
    vi.mocked(getPlanets).mockResolvedValue([
      {
        index: 1,
        name: "Turing",
        sector: "Umlaut",
        position: { x: 0, y: 0 },
        health: 1,
        maxHealth: 1,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
      {
        name: "No Index",
        sector: "S1",
        position: { x: 0, y: 0 },
        health: 1,
        maxHealth: 1,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
    ]);

    const entries = await sitemap();
    expect(entries).toHaveLength(2);
    expect(entries[1].url).toBe(`${siteConfig.url}/planet/1`);
  });
});
