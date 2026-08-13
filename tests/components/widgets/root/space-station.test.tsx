import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getSpaceStations } from "@/lib/data/space-station";
import SpaceStation from "@/components/widgets/root/space-station";
import type { SpaceStation as SpaceStationType } from "@/types/space-station";

vi.mock("@/lib/data/space-station", () => ({
  getSpaceStations: vi.fn(),
}));

function makePlanet() {
  return {
    name: "Malevelon Creek",
    sector: "Testudo",
    position: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    regenPerSecond: 0,
    currentOwner: "Humans",
    initialOwner: "Humans",
    statistics: { playerCount: 10 },
  };
}

describe("SpaceStation", () => {
  it("renders an error state when stations fail to load", async () => {
    vi.mocked(getSpaceStations).mockResolvedValue(null);

    const html = renderToStaticMarkup(await SpaceStation());

    expect(html).toContain("Unable to load space station data");
  });

  it("renders an empty state when there are no stations", async () => {
    vi.mocked(getSpaceStations).mockResolvedValue([]);

    const html = renderToStaticMarkup(await SpaceStation());

    expect(html).toContain("No active space stations");
  });

  it("renders station name and its most relevant tactical action", async () => {
    const stations: SpaceStationType[] = [
      {
        id32: 1,
        planet: makePlanet(),
        electionEnd: new Date(Date.now() + 3600000).toISOString(),
        flags: 0,
        tacticalActions: [
          {
            id32: 10,
            name: "Orbital Bombardment",
            description: "Strike the enemy",
            strategicDescription: "",
            status: 1,
            statusExpire: "",
            costs: [
              {
                id: "c1",
                targetValue: 100,
                currentValue: 50,
                deltaPerSecond: 0,
              },
            ],
          },
        ],
      },
    ];
    vi.mocked(getSpaceStations).mockResolvedValue(stations);

    const html = renderToStaticMarkup(await SpaceStation());

    expect(html).toContain("Malevelon Creek");
    expect(html).toContain("Orbital Bombardment");
  });
});
