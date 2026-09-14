import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPlanets } from "@/lib/data/planets";
import GalaxyBrowserServer from "@/components/widgets/galaxy/galaxy-browser-server";
import type { Planet } from "@/types/campaigns";

vi.mock("@/lib/data/planets", () => ({
  getPlanets: vi.fn(),
}));

const planets: Planet[] = [
  {
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
  {
    index: 2,
    name: "Heeth",
    sector: "Orion",
    position: { x: 1, y: 1 },
    health: 1000000,
    maxHealth: 1000000,
    regenPerSecond: 0,
    currentOwner: "Humans",
    initialOwner: "Humans",
    statistics: { playerCount: 50 },
  },
];

describe("GalaxyBrowserServer", () => {
  it("renders an error state when planets fail to load", async () => {
    vi.mocked(getPlanets).mockResolvedValue(null);

    const html = renderToStaticMarkup(await GalaxyBrowserServer());
    expect(html).toContain("Unable to load the galaxy");
  });

  it("renders galaxy aggregate counts", async () => {
    vi.mocked(getPlanets).mockResolvedValue(planets);

    const html = renderToStaticMarkup(await GalaxyBrowserServer());
    expect(html).toContain("planets");
    expect(html).toContain("held");
    expect(html).toContain("contested");
  });
});
