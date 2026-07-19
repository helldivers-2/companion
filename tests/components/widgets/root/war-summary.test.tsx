import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDashboardStats } from "@/lib/data/dashboard";
import WarSummary from "@/components/widgets/root/war-summary";

vi.mock("@/lib/data/dashboard", () => ({
  getDashboardStats: vi.fn(),
}));

describe("WarSummary", () => {
  it("renders an unavailable message when stats fail to load", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue(null);

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

    const html = renderToStaticMarkup(await WarSummary());

    expect(html).toContain("Players");
    expect(html).toContain("Active");
    expect(html).toContain("7");
  });
});
