import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getWarInfo } from "@/lib/data/war";
import WarSummary from "@/components/widgets/root/war-summary";

vi.mock("@/lib/data/dashboard", () => ({
  getDashboardStats: vi.fn(),
}));

vi.mock("@/lib/data/war", () => ({
  getWarInfo: vi.fn(),
}));

const warInfo = {
  started: "2024-01-23T20:05:13Z",
  ended: "2028-02-08T20:04:55Z",
  now: "2026-09-14T00:00:00Z",
  clientVersion: "0.3.0",
  factions: ["Humans"],
  impactMultiplier: 0.014,
  statistics: {
    playerCount: 1,
    missionSuccessRate: 1,
    missionsWon: 1,
    missionTime: 1,
    terminidKills: 1,
    automatonKills: 1,
    illuminateKills: 1,
    bulletsFired: 1,
    deaths: 1,
    friendlies: 1,
    missionsLost: 1,
  },
};

describe("WarSummary", () => {
  it("renders an unavailable message when stats fail to load", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue(null);
    vi.mocked(getWarInfo).mockResolvedValue(warInfo);

    const html = renderToStaticMarkup(await WarSummary());

    expect(html).toContain("War status temporarily unavailable");
  });

  it("renders player and campaign counts", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      playerCount: 123456,
      activeCount: 7,
      eventCount: 2,
      liberatedCount: 3,
    });
    vi.mocked(getWarInfo).mockResolvedValue(warInfo);

    const html = renderToStaticMarkup(await WarSummary());

    expect(html).toContain("Players");
    expect(html).toContain("Active");
    expect(html).toContain("7");
  });

  it("renders the war impact multiplier when available", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      playerCount: 1,
      activeCount: 1,
      eventCount: 1,
      liberatedCount: 1,
    });
    vi.mocked(getWarInfo).mockResolvedValue(warInfo);

    const html = renderToStaticMarkup(await WarSummary());

    expect(html).toContain("Impact");
    expect(html).toContain("0.0140");
  });

  it("hides the impact multiplier when the war payload is unavailable", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      playerCount: 1,
      activeCount: 1,
      eventCount: 1,
      liberatedCount: 1,
    });
    vi.mocked(getWarInfo).mockResolvedValue(null);

    const html = renderToStaticMarkup(await WarSummary());

    expect(html).not.toContain("Impact");
  });
});
