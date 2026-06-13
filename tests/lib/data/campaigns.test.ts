import { describe, it, expect, vi } from "vitest";
import { getCampaignData } from "@/lib/data/campaigns";
import { fetchCampaigns } from "@/lib/services/campaigns";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/campaigns", () => ({
  fetchCampaigns: vi.fn(),
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
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchCampaigns).mockRejectedValue(new Error("fail"));
    const result = await getCampaignData();
    expect(result).toBeNull();
  });
});
