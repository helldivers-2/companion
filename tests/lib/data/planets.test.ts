import { describe, it, expect, vi } from "vitest";
import { getPlanets, getPlanetEvents, getPlanet } from "@/lib/data/planets";
import {
  fetchPlanets,
  fetchPlanetEvents,
  fetchPlanet,
} from "@/lib/services/planets";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/planets", () => ({
  fetchPlanets: vi.fn(),
  fetchPlanetEvents: vi.fn(),
  fetchPlanet: vi.fn(),
}));

const planet = {
  index: 1,
  name: "Test",
  sector: "S1",
  position: { x: 0, y: 0 },
  health: 50,
  maxHealth: 100,
  regenPerSecond: 0,
  currentOwner: "Humans",
  initialOwner: "Humans",
  statistics: { playerCount: 100 },
};

describe("getPlanets", () => {
  it("maps DTOs to domain planets", async () => {
    vi.mocked(fetchPlanets).mockResolvedValue([planet]);
    const result = await getPlanets();
    if (result === null) throw new Error("Expected result");
    expect(result[0].name).toBe("Test");
    expect(result[0].index).toBe(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchPlanets).mockRejectedValue(new Error("fail"));
    expect(await getPlanets()).toBeNull();
  });
});

describe("getPlanetEvents", () => {
  it("maps event planets", async () => {
    vi.mocked(fetchPlanetEvents).mockResolvedValue([planet]);
    const result = await getPlanetEvents();
    if (result === null) throw new Error("Expected result");
    expect(result).toHaveLength(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchPlanetEvents).mockRejectedValue(new Error("fail"));
    expect(await getPlanetEvents()).toBeNull();
  });
});

describe("getPlanet", () => {
  it("maps a single planet", async () => {
    vi.mocked(fetchPlanet).mockResolvedValue(planet);
    const result = await getPlanet(1);
    if (result === null) throw new Error("Expected result");
    expect(result.name).toBe("Test");
    expect(fetchPlanet).toHaveBeenCalledWith(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchPlanet).mockRejectedValue(new Error("fail"));
    expect(await getPlanet(1)).toBeNull();
  });
});
