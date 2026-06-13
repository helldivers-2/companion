import { describe, it, expect, vi } from "vitest";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getCampaignData } from "@/lib/data/campaigns";
import { getWarStats } from "@/lib/data/war";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/data/campaigns", () => ({
  getCampaignData: vi.fn(),
}));

vi.mock("@/lib/data/war", () => ({
  getWarStats: vi.fn(),
}));

describe("getDashboardStats", () => {
  it("returns dashboard data", async () => {
    vi.mocked(getCampaignData).mockResolvedValue({
      campaigns: [],
      activePlanets: [
        {
          id: 1,
          planet: {
            name: "Test",
            sector: "S1",
            position: { x: 0, y: 0 },
            health: 50,
            maxHealth: 100,
            regenPerSecond: 0,
            currentOwner: "Humans",
            initialOwner: "Humans",
            statistics: { playerCount: 0 },
            event: null,
          },
          faction: "Terminids",
        },
      ],
      liberatedPlanets: [],
      liberatedPlayerCount: 0,
    });
    vi.mocked(getWarStats).mockResolvedValue({
      playerCount: 1000,
      missionSuccessRate: 0,
      missionsWon: 0,
      missionTime: 0,
      terminidKills: 0,
      automatonKills: 0,
      illuminateKills: 0,
      bulletsFired: 0,
      deaths: 0,
      friendlies: 0,
      missionsLost: 0,
    });

    const result = await getDashboardStats();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result.playerCount).toBe(1000);
    expect(result.activeCount).toBe(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(getCampaignData).mockRejectedValue(new Error("fail"));
    vi.mocked(getWarStats).mockRejectedValue(new Error("fail"));

    const result = await getDashboardStats();
    expect(result).toBeNull();
  });
});
