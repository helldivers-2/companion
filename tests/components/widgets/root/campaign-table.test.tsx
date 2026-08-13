import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getCampaignData } from "@/lib/data/campaigns";
import CampaignTable from "@/components/widgets/root/campaign-table";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";
import type { Campaign } from "@/types/campaigns";

vi.mock("@/lib/data/campaigns", () => ({
  getCampaignData: vi.fn(),
}));

function makeCampaign(overrides: { name?: string } = {}): Campaign {
  return {
    id: overrides.name ?? 1,
    faction: "Automaton",
    planet: {
      name: overrides.name ?? "Malevelon Creek",
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

  it("passes the moving/parked split and liberated player count to the client table", async () => {
    const parkedPlanets = [makeCampaign()];
    vi.mocked(getCampaignData).mockResolvedValue({
      campaigns: parkedPlanets,
      activePlanets: parkedPlanets,
      movingPlanets: [],
      parkedPlanets,
      liberatedPlanets: [],
      liberatedPlayerCount: 42,
    });

    const element = await CampaignTable();

    expect(element.type).toBe(CampaignTableClient);
    expect(element.props.movingPlanets).toEqual([]);
    expect(element.props.parkedPlanets).toEqual(parkedPlanets);
    expect(element.props.liberatedCount).toBe(0);
    expect(element.props.liberatedPlayerCount).toBe(42);
  });

  it("omits the liberated summary row when nothing is liberated", () => {
    const html = renderToStaticMarkup(
      <CampaignTableClient
        movingPlanets={[makeCampaign()]}
        parkedPlanets={[]}
        liberatedCount={0}
        liberatedPlayerCount={0}
      />,
    );

    expect(html).not.toContain("Liberated Planets");
  });

  it("renders the liberated summary row with its planet count", () => {
    const html = renderToStaticMarkup(
      <CampaignTableClient
        movingPlanets={[makeCampaign()]}
        parkedPlanets={[]}
        liberatedCount={3}
        liberatedPlayerCount={1500}
      />,
    );

    expect(html).toContain("Liberated Planets");
    expect(html).toContain("(3)");
  });

  it("collapses parked planets into one grouped row per faction", () => {
    const html = renderToStaticMarkup(
      <CampaignTableClient
        movingPlanets={[]}
        parkedPlanets={[
          makeCampaign({ name: "Parked A" }),
          makeCampaign({ name: "Parked B" }),
        ]}
        liberatedCount={0}
        liberatedPlayerCount={0}
      />,
    );

    expect(html).toContain("No progress");
    expect(html).toContain("(2)");
    // Collapsed by default, so the individual planets stay out of the markup.
    expect(html).not.toContain("Parked A");
    expect(html).not.toContain("Parked B");
  });

  it("names the leading region when progress is region-only", () => {
    const campaign = makeCampaign({ name: "Matar Bay" });
    campaign.planet.regions = [
      {
        name: "PARRHESIA",
        health: 74,
        maxHealth: 100,
        isAvailable: true,
        players: 411,
      },
    ];

    const html = renderToStaticMarkup(
      <CampaignTableClient
        movingPlanets={[campaign]}
        parkedPlanets={[]}
        liberatedCount={0}
        liberatedPlayerCount={0}
      />,
    );

    expect(html).toContain("PARRHESIA");
    expect(html).toContain("26.00%");
  });
});
