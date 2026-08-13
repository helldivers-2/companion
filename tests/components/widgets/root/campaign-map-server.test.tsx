import { describe, it, expect, vi } from "vitest";
import { getCampaignData } from "@/lib/data/campaigns";
import CampaignMapServer from "@/components/widgets/root/campaign-map-server";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";
import type { Campaign } from "@/types/campaigns";

vi.mock("@/lib/data/campaigns", () => ({
  getCampaignData: vi.fn(),
}));

function makeCampaign(): Campaign {
  return {
    id: 1,
    faction: "Terminids",
    planet: {
      name: "Hellmire",
      sector: "Draco",
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      regenPerSecond: 0,
      currentOwner: "Terminids",
      initialOwner: "Humans",
      statistics: { playerCount: 5 },
    },
  };
}

describe("CampaignMapServer", () => {
  it("passes an error message to the map when campaign data fails to load", async () => {
    vi.mocked(getCampaignData).mockResolvedValue(null);

    const element = await CampaignMapServer();

    expect(element.type).toBe(CampaignMap);
    expect(element.props.error).toBe(
      "Failed to load campaign data. Please try again later.",
    );
    expect(element.props.movingPlanets).toEqual([]);
    expect(element.props.parkedPlanets).toEqual([]);
    expect(element.props.liberatedPlanets).toEqual([]);
  });

  it("passes moving, parked, and liberated planets to the map on success", async () => {
    const movingPlanets = [makeCampaign()];
    const parkedPlanets = [makeCampaign()];
    const liberatedPlanets = [makeCampaign()];
    vi.mocked(getCampaignData).mockResolvedValue({
      campaigns: [...movingPlanets, ...parkedPlanets, ...liberatedPlanets],
      activePlanets: [...movingPlanets, ...parkedPlanets],
      movingPlanets,
      parkedPlanets,
      liberatedPlanets,
      liberatedPlayerCount: 0,
    });

    const element = await CampaignMapServer();

    expect(element.props.error).toBeNull();
    expect(element.props.movingPlanets).toEqual(movingPlanets);
    expect(element.props.parkedPlanets).toEqual(parkedPlanets);
    expect(element.props.liberatedPlanets).toEqual(liberatedPlanets);
  });
});
