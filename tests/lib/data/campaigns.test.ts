import { describe, it, expect, vi } from "vitest";
import { getCampaignData, getCampaign } from "@/lib/data/campaigns";
import { fetchCampaigns, fetchCampaign } from "@/lib/services/campaigns";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/campaigns", () => ({
  fetchCampaigns: vi.fn(),
  fetchCampaign: vi.fn(),
}));

describe("getCampaignData", () => {
  it("returns campaign stats on success", async () => {
    const mock = [
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
        },
        faction: "Terminids",
      },
    ];
    vi.mocked(fetchCampaigns).mockResolvedValue(mock);

    const result = await getCampaignData();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result.activePlanets).toHaveLength(1);
    expect(result.supplyLines).toEqual([]);
  });

  it("derives supply lines from campaign waypoints", async () => {
    const planet = (index: number, name: string, waypoints: number[]) => ({
      index,
      name,
      sector: "S1",
      position: { x: 0, y: 0 },
      health: 50,
      maxHealth: 100,
      regenPerSecond: 0,
      currentOwner: "Automaton",
      initialOwner: "Humans",
      statistics: { playerCount: 0 },
      waypoints,
    });
    vi.mocked(fetchCampaigns).mockResolvedValue([
      { id: 1, planet: planet(1, "A", [2]), faction: "Automaton" },
      { id: 2, planet: planet(2, "B", [1]), faction: "Automaton" },
    ]);

    const result = await getCampaignData();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result.supplyLines).toHaveLength(1);
    expect(result.supplyLines[0].from.name).toBe("A");
    expect(result.supplyLines[0].to.name).toBe("B");
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchCampaigns).mockRejectedValue(new Error("fail"));
    const result = await getCampaignData();
    expect(result).toBeNull();
  });
});

describe("getCampaign", () => {
  const campaign = {
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
    },
    faction: "Terminids",
  };

  it("maps a single campaign", async () => {
    vi.mocked(fetchCampaign).mockResolvedValue(campaign);
    const result = await getCampaign(1);
    if (result === null) throw new Error("Expected result");
    expect(result.planet.name).toBe("Test");
    expect(fetchCampaign).toHaveBeenCalledWith(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchCampaign).mockRejectedValue(new Error("fail"));
    expect(await getCampaign(1)).toBeNull();
  });
});
