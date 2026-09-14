import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPlanet } from "@/lib/data/planets";
import { getGalaxySummary } from "@/lib/data/war-metadata";
import PlanetPage from "@/app/planet/[index]/page";
import type { Planet } from "@/types/campaigns";

vi.mock("@/lib/data/planets", () => ({
  getPlanet: vi.fn(),
}));

vi.mock("@/lib/data/war-metadata", () => ({
  getGalaxySummary: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const planet: Planet = {
  index: 1,
  name: "Turing",
  sector: "Umlaut",
  position: { x: 0, y: 0 },
  health: 500000,
  maxHealth: 1000000,
  regenPerSecond: 0,
  currentOwner: "Automaton",
  initialOwner: "Humans",
  statistics: { playerCount: 100 },
  regions: [
    { name: "NEW COB", health: 50000, maxHealth: 100000, isAvailable: true },
  ],
};

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

describe("PlanetPage", () => {
  it("rejects a non-numeric index", async () => {
    await expect(
      PlanetPage({ params: Promise.resolve({ index: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects an unknown planet", async () => {
    vi.mocked(getPlanet).mockResolvedValue(null);
    await expect(
      PlanetPage({ params: Promise.resolve({ index: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the planet overview and the battle-record shell", async () => {
    vi.mocked(getPlanet).mockResolvedValue(planet);
    vi.mocked(getGalaxySummary).mockResolvedValue({
      galaxy: galaxyStats,
      planets: { 1: { planetIndex: 1, ...galaxyStats } },
    });

    const html = renderToStaticMarkup(
      await PlanetPage({ params: Promise.resolve({ index: "1" }) }),
    );

    expect(html).toContain("Turing");
    expect(html).toContain("Umlaut");
    expect(html).toContain("NEW COB");
    expect(html).toContain("Battle Record");
  });
});
