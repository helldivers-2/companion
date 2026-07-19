import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getCampaignData } from "@/lib/data/campaigns";
import CampaignTable from "@/components/widgets/root/campaign-table";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";
import type { Campaign } from "@/types/campaigns";

vi.mock("@/lib/data/campaigns", () => ({
  getCampaignData: vi.fn(),
}));

function makeCampaign(): Campaign {
  return {
    id: 1,
    faction: "Automaton",
    planet: {
      name: "Malevelon Creek",
      sector: "Testudo",
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      regenPerSecond: 0,
      currentOwner: "Automaton",
      initialOwner: "Humans",
      statistics: { playerCount: 10 },
    },
  };
}

describe("CampaignTable", () => {
  it("renders an error message when campaign data fails to load", async () => {
    vi.mocked(getCampaignData).mockResolvedValue(null);

    const html = renderToStaticMarkup(await CampaignTable());

    expect(html).toContain("Failed to load campaign data");
  });

  it("passes active planets and liberated player count to the client table", async () => {
    const activePlanets = [makeCampaign()];
    vi.mocked(getCampaignData).mockResolvedValue({
      campaigns: activePlanets,
      activePlanets,
      liberatedPlanets: [],
      liberatedPlayerCount: 42,
    });

    const element = await CampaignTable();

    expect(element.type).toBe(CampaignTableClient);
    expect(element.props.activePlanets).toEqual(activePlanets);
    expect(element.props.liberatedPlayerCount).toBe(42);
  });
});
