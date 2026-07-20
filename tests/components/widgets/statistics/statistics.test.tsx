import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getWarStats } from "@/lib/data/war";
import Statistics from "@/components/widgets/statistics/statistics";
import type { WarStats } from "@/types/war";

vi.mock("@/lib/data/war", () => ({
  getWarStats: vi.fn(),
}));

function makeWarStats(): WarStats {
  return {
    playerCount: 100000,
    missionSuccessRate: 75.6,
    missionsWon: 5000,
    missionTime: 3600 * 24 * 365 * 100,
    terminidKills: 1000000,
    automatonKills: 2000000,
    illuminateKills: 3000000,
    bulletsFired: 4000000,
    deaths: 50000,
    friendlies: 100,
    missionsLost: 200,
  };
}

describe("Statistics", () => {
  it("renders an unavailable message when stats fail to load", async () => {
    vi.mocked(getWarStats).mockResolvedValue(null);

    const html = renderToStaticMarkup(await Statistics());

    expect(html).toContain("Statistics temporarily unavailable");
  });

  it("renders formatted stat cards", async () => {
    vi.mocked(getWarStats).mockResolvedValue(makeWarStats());

    const html = renderToStaticMarkup(await Statistics());

    expect(html).toContain("Patriots in Game");
    expect(html).toContain("Pesty Bugs Killed");
    // success rate is already a percentage — rendered rounded, not millified
    expect(html).toContain("76%");
  });
});
