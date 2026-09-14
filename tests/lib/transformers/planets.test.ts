import { describe, it, expect } from "vitest";
import {
  getGalaxyPlanetStats,
  getOwningFactions,
  getSectors,
  filterPlanets,
  isHumanOwned,
} from "@/lib/transformers/planets";
import type { Planet } from "@/types/campaigns";

function makePlanet(overrides: Partial<Planet> = {}): Planet {
  return {
    name: "Test",
    sector: "S1",
    position: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    regenPerSecond: 0,
    currentOwner: "Humans",
    initialOwner: "Humans",
    statistics: { playerCount: 0 },
    event: null,
    ...overrides,
  };
}

describe("getGalaxyPlanetStats", () => {
  it("counts ownership, events, contested worlds and players", () => {
    const stats = getGalaxyPlanetStats([
      makePlanet({ name: "Home", statistics: { playerCount: 10 } }),
      makePlanet({
        name: "Push",
        currentOwner: "Automaton",
        initialOwner: "Humans",
        statistics: { playerCount: 20 },
      }),
      makePlanet({
        name: "Bug Home",
        currentOwner: "Terminids",
        initialOwner: "Terminids",
        statistics: { playerCount: 5 },
      }),
      makePlanet({
        name: "Defended",
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 7 },
        event: {
          id: 1,
          eventType: 1,
          faction: "Automaton",
          health: 50,
          maxHealth: 100,
          startTime: "2026-01-01T00:00:00Z",
          endTime: "2026-01-02T00:00:00Z",
        },
      }),
    ]);

    expect(stats.totalPlanets).toBe(4);
    expect(stats.activeEvents).toBe(1);
    expect(stats.humanOwned).toBe(2);
    expect(stats.enemyOwned).toBe(2);
    expect(stats.contested).toBe(1);
    expect(stats.totalPlayers).toBe(42);
  });

  it("returns zeroes for an empty galaxy", () => {
    expect(getGalaxyPlanetStats([])).toEqual({
      totalPlanets: 0,
      activeEvents: 0,
      humanOwned: 0,
      enemyOwned: 0,
      contested: 0,
      totalPlayers: 0,
    });
  });
});

describe("isHumanOwned", () => {
  it("is true only for Human-owned planets", () => {
    expect(isHumanOwned(makePlanet())).toBe(true);
    expect(isHumanOwned(makePlanet({ currentOwner: "Automaton" }))).toBe(false);
  });
});

describe("getOwningFactions", () => {
  it("returns present factions in canonical species order", () => {
    const factions = getOwningFactions([
      makePlanet({ currentOwner: "Automaton" }),
      makePlanet({ currentOwner: "Humans" }),
      makePlanet({ currentOwner: "Terminids" }),
    ]);
    expect(factions).toEqual(["Humans", "Terminids", "Automaton"]);
  });

  it("appends unknown owners after the known ones", () => {
    const factions = getOwningFactions([
      makePlanet({ currentOwner: "Unknown" }),
      makePlanet({ currentOwner: "Humans" }),
    ]);
    expect(factions).toEqual(["Humans", "Unknown"]);
  });
});

describe("getSectors", () => {
  it("dedupes and sorts sectors", () => {
    expect(
      getSectors([
        makePlanet({ sector: "Zeta" }),
        makePlanet({ sector: "Alpha" }),
        makePlanet({ sector: "Zeta" }),
      ]),
    ).toEqual(["Alpha", "Zeta"]);
  });
});

describe("filterPlanets", () => {
  const planets = [
    makePlanet({ name: "Turing", sector: "Umlaut", currentOwner: "Automaton" }),
    makePlanet({ name: "Heeth", sector: "Orion", currentOwner: "Terminids" }),
    makePlanet({
      name: "Draupnir",
      sector: "Orion",
      currentOwner: "Humans",
      event: {
        id: 1,
        eventType: 1,
        faction: "Automaton",
        health: 50,
        maxHealth: 100,
        startTime: "2026-01-01T00:00:00Z",
        endTime: "2026-01-02T00:00:00Z",
      },
    }),
  ];

  it("filters by faction", () => {
    expect(
      filterPlanets(planets, { faction: "Terminids" }).map((p) => p.name),
    ).toEqual(["Heeth"]);
  });

  it("filters by sector", () => {
    expect(filterPlanets(planets, { sector: "Orion" })).toHaveLength(2);
  });

  it("filters by name or sector query, case-insensitively", () => {
    expect(filterPlanets(planets, { query: "heeth" })).toHaveLength(1);
    expect(filterPlanets(planets, { query: "orion" })).toHaveLength(2);
  });

  it("filters to event planets only", () => {
    expect(
      filterPlanets(planets, { eventsOnly: true }).map((p) => p.name),
    ).toEqual(["Draupnir"]);
  });

  it("sorts by player count descending", () => {
    const result = filterPlanets([
      makePlanet({ name: "Quiet", statistics: { playerCount: 1 } }),
      makePlanet({ name: "Busy", statistics: { playerCount: 100 } }),
    ]);
    expect(result.map((p) => p.name)).toEqual(["Busy", "Quiet"]);
  });
});
