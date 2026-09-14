import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getCampaign } from "@/lib/data/campaigns";
import CampaignPage from "@/app/campaign/[index]/page";

vi.mock("@/lib/data/campaigns", () => ({
  getCampaign: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("CampaignPage", () => {
  it("rejects a non-numeric index", async () => {
    await expect(
      CampaignPage({ params: Promise.resolve({ index: "abc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects an unknown campaign", async () => {
    vi.mocked(getCampaign).mockResolvedValue(null);
    await expect(
      CampaignPage({ params: Promise.resolve({ index: "1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the campaign front", async () => {
    vi.mocked(getCampaign).mockResolvedValue({
      id: 1,
      faction: "Automaton",
      planet: {
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
      },
    });

    const html = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ index: "1" }) }),
    );
    expect(html).toContain("Turing");
    expect(html).toContain("Automaton Front");
  });
});
