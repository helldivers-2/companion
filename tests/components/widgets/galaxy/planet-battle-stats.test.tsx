import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getGalaxySummary } from "@/lib/data/war-metadata";
import PlanetBattleStats from "@/components/widgets/galaxy/planet-battle-stats";

vi.mock("@/lib/data/war-metadata", () => ({
  getGalaxySummary: vi.fn(),
}));

const galaxyStats = {
  missionsWon: 100,
  missionsLost: 10,
  missionTime: 1000,
  bugKills: 1,
  automatonKills: 2,
  illuminateKills: 3,
  bulletsFired: 100,
  bulletsHit: 50,
  timePlayed: 1000,
  deaths: 5,
  friendlies: 1,
  missionSuccessRate: 90,
};

describe("PlanetBattleStats", () => {
  it("renders nothing without an index", async () => {
    vi.mocked(getGalaxySummary).mockResolvedValue(null);
    const html = renderToStaticMarkup(
      await PlanetBattleStats({ planetIndex: undefined }),
    );
    expect(html).toBe("");
  });

  it("renders a missing-stats message when the planet has no record", async () => {
    vi.mocked(getGalaxySummary).mockResolvedValue({
      galaxy: galaxyStats,
      planets: {},
    });

    const html = renderToStaticMarkup(
      await PlanetBattleStats({ planetIndex: 1 }),
    );
    expect(html).toContain("No battle statistics recorded");
  });

  it("renders the per-planet battle record", async () => {
    vi.mocked(getGalaxySummary).mockResolvedValue({
      galaxy: galaxyStats,
      planets: { 1: { planetIndex: 1, ...galaxyStats } },
    });

    const html = renderToStaticMarkup(
      await PlanetBattleStats({ planetIndex: 1 }),
    );
    expect(html).toContain("Missions Won");
    expect(html).toContain("Success Rate");
    expect(html).toContain("90%");
  });
});
