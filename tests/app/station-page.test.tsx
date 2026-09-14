import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getSpaceStation } from "@/lib/data/space-station";
import StationPage from "@/app/station/[index]/page";
import type { SpaceStation } from "@/types/space-station";

vi.mock("@/lib/data/space-station", () => ({
  getSpaceStation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const station: SpaceStation = {
  id32: 749875195,
  planet: {
    name: "Vandalon IV",
    sector: "Mirror",
    position: { x: 0, y: 0 },
    health: 1000000,
    maxHealth: 1000000,
    regenPerSecond: 0,
    currentOwner: "Humans",
    initialOwner: "Humans",
    statistics: { playerCount: 0 },
  },
  electionEnd: "2099-01-01T00:00:00Z",
  flags: 0,
  tacticalActions: [
    {
      id32: 1,
      name: "Eagle Storm",
      description: "Carpet bomb the front.",
      strategicDescription: "Strategic.",
      status: 1,
      statusExpire: "2099-01-01T00:00:00Z",
      costs: [
        { id: "Donations", targetValue: 100, currentValue: 40, deltaPerSecond: 0 },
      ],
    },
  ],
};

describe("StationPage", () => {
  it("rejects a non-numeric index", async () => {
    await expect(
      StationPage({ params: Promise.resolve({ index: "abc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects an unknown station", async () => {
    vi.mocked(getSpaceStation).mockResolvedValue(null);
    await expect(
      StationPage({ params: Promise.resolve({ index: "1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the station and its tactical actions", async () => {
    vi.mocked(getSpaceStation).mockResolvedValue(station);

    const html = renderToStaticMarkup(
      await StationPage({ params: Promise.resolve({ index: "1" }) }),
    );
    expect(html).toContain("Vandalon IV");
    expect(html).toContain("Eagle Storm");
    expect(html).toContain("Active");
  });
});
