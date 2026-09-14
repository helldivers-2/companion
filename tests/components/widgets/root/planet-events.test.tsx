import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPlanetEvents } from "@/lib/data/planets";
import PlanetEvents from "@/components/widgets/root/planet-events";
import type { Planet } from "@/types/campaigns";

vi.mock("@/lib/data/planets", () => ({
  getPlanetEvents: vi.fn(),
}));

const defense: Planet = {
  index: 262,
  name: "K",
  sector: "Trigon",
  position: { x: 0, y: 0 },
  health: 2000000,
  maxHealth: 2000000,
  regenPerSecond: 0,
  currentOwner: "Humans",
  initialOwner: "Humans",
  statistics: { playerCount: 5000 },
  event: {
    id: 1,
    eventType: 1,
    faction: "Automaton",
    health: 1000000,
    maxHealth: 2000000,
    startTime: "2026-01-01T00:00:00Z",
    endTime: "2099-01-02T00:00:00Z",
  },
};

describe("PlanetEvents", () => {
  it("renders an error state when events fail to load", async () => {
    vi.mocked(getPlanetEvents).mockResolvedValue(null);

    const html = renderToStaticMarkup(await PlanetEvents());
    expect(html).toContain("Unable to load active defenses");
  });

  it("renders an empty state when nothing is under attack", async () => {
    vi.mocked(getPlanetEvents).mockResolvedValue([]);

    const html = renderToStaticMarkup(await PlanetEvents());
    expect(html).toContain("No Active Defenses");
  });

  it("renders each defense with its held percentage", async () => {
    vi.mocked(getPlanetEvents).mockResolvedValue([defense]);

    const html = renderToStaticMarkup(await PlanetEvents());
    expect(html).toContain("K");
    expect(html).toContain("50.00% held");
    expect(html).toContain("Defending");
  });
});
