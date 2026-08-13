import { describe, it, expect } from "vitest";
import {
  getLiberation,
  getRegenRate,
  getStatus,
  getPlanetStats,
  getCampaignStats,
  getLeadingRegion,
  getCampaignProgress,
  isMoving,
  STATUS_TEXT_CLASS,
  getEnemyKills,
  mapPlanetDto,
  mapCampaignDto,
  species,
} from "@/lib/transformers/campaigns";
import type { Planet } from "@/types/campaigns";

describe("species", () => {
  it("has 4 factions", () => {
    expect(species).toHaveLength(4);
  });
});

describe("mapPlanetDto", () => {
  it("maps all fields", () => {
    const dto = {
      name: "Test",
      sector: "S1",
      position: { x: 1, y: 2 },
      health: 50,
      maxHealth: 100,
      regenPerSecond: 1,
      currentOwner: "Humans",
      initialOwner: "Humans",
      statistics: { playerCount: 10 },
      event: null,
    };
    const planet = mapPlanetDto(dto);
    expect(planet.name).toBe("Test");
    expect(planet.position.x).toBe(1);
    expect(planet.event).toBeNull();
  });
});

describe("mapCampaignDto", () => {
  it("maps campaign fields", () => {
    const dto = {
      id: 1,
      planet: {
        name: "Test",
        sector: "S1",
        position: { x: 0, y: 0 },
        health: 50,
        maxHealth: 100,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
      faction: "Terminids",
    };
    const campaign = mapCampaignDto(dto);
    expect(campaign.faction).toBe("Terminids");
    expect(campaign.planet.name).toBe("Test");
  });
});

describe("getLiberation", () => {
  it("calculates liberation percentage", () => {
    expect(getLiberation(50, 100)).toBe("50.00");
  });
  it("clamps to 0-100", () => {
    expect(getLiberation(-10, 100)).toBe("100.00");
    expect(getLiberation(110, 100)).toBe("0.00");
  });
  it("handles inverse mode", () => {
    expect(getLiberation(50, 100, true)).toBe("50.00");
  });
  it("returns 0 for maxHealth 0", () => {
    expect(getLiberation(50, 0)).toBe("0.00");
  });
});

describe("getRegenRate", () => {
  it("calculates positive hourly regen percentage", () => {
    // 0.01 hp/s * 3600 = 36 hp/hr against maxHealth 100 = 36 %/hr
    expect(getRegenRate(0.01, 100)).toBeCloseTo(36, 1);
  });
  it("returns 0 for maxHealth 0", () => {
    expect(getRegenRate(0.01, 0)).toBe(0);
  });
  it("returns 0 for no regen", () => {
    expect(getRegenRate(0, 100)).toBe(0);
  });
});

describe("getStatus", () => {
  it("returns Counterattacking for meaningful regen", () => {
    expect(getStatus(1).text).toBe("Counterattacking");
  });
  it("returns Stable for negligible regen", () => {
    expect(getStatus(0).text).toBe("Stable");
    expect(getStatus(0.5).text).toBe("Stable");
  });
  it("returns Liberating when regen is negative", () => {
    expect(getStatus(-0.5).text).toBe("Liberating");
  });
});

function makePlanet(overrides: Partial<Planet> = {}): Planet {
  return {
    name: "Test",
    sector: "S1",
    position: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    regenPerSecond: 0,
    currentOwner: "Automaton",
    initialOwner: "Humans",
    statistics: { playerCount: 0 },
    event: null,
    ...overrides,
  };
}

describe("getLeadingRegion", () => {
  it("returns null when the planet carries no regions", () => {
    expect(getLeadingRegion(makePlanet())).toBeNull();
  });

  it("ignores locked regions", () => {
    const planet = makePlanet({
      regions: [
        { name: "Locked", health: 10, maxHealth: 100, isAvailable: false },
        { name: "Open", health: 90, maxHealth: 100, isAvailable: true },
      ],
    });
    expect(getLeadingRegion(planet)?.name).toBe("Open");
  });

  it("falls back to a chipped region when every region is locked", () => {
    const planet = makePlanet({
      regions: [
        { name: "Untouched", health: 100, maxHealth: 100, isAvailable: false },
        { name: "Chipped", health: 40, maxHealth: 100, isAvailable: false },
      ],
    });
    expect(getLeadingRegion(planet)?.name).toBe("Chipped");
  });

  it("picks the most liberated open region, breaking ties on players", () => {
    const regions = [
      {
        name: "Quiet",
        health: 100,
        maxHealth: 100,
        isAvailable: true,
        players: 5,
      },
      {
        name: "Busy",
        health: 100,
        maxHealth: 100,
        isAvailable: true,
        players: 900,
      },
      {
        name: "Pushed",
        health: 60,
        maxHealth: 100,
        isAvailable: true,
        players: 1,
      },
    ];
    expect(getLeadingRegion(makePlanet({ regions }))?.name).toBe("Pushed");
    expect(
      getLeadingRegion(makePlanet({ regions: regions.slice(0, 2) }))?.name,
    ).toBe("Busy");
  });
});

describe("getCampaignProgress", () => {
  it("reports defense health remaining for events", () => {
    const planet = makePlanet({
      event: {
        id: 1,
        eventType: 1,
        faction: "Illuminate",
        health: 40,
        maxHealth: 100,
        startTime: "2026-01-01T00:00:00Z",
        endTime: "2026-01-02T00:00:00Z",
      },
    });
    const progress = getCampaignProgress(planet);
    expect(progress.scope).toBe("event");
    expect(progress.value).toBe("40.00");
  });

  it("prefers planet health when the planet itself has moved", () => {
    const progress = getCampaignProgress(makePlanet({ health: 25 }));
    expect(progress.scope).toBe("planet");
    expect(progress.value).toBe("75.00");
    expect(progress.label).toBeNull();
  });

  it("falls through to the leading region when the planet reads full health", () => {
    const planet = makePlanet({
      regions: [
        { name: "PARRHESIA", health: 74, maxHealth: 100, isAvailable: true },
      ],
    });
    const progress = getCampaignProgress(planet);
    expect(progress.scope).toBe("region");
    expect(progress.value).toBe("26.00");
    expect(progress.label).toBe("PARRHESIA");
  });

  it("reports zero when neither the planet nor its regions have moved", () => {
    const planet = makePlanet({
      regions: [
        { name: "OLD DOVE", health: 100, maxHealth: 100, isAvailable: true },
      ],
    });
    expect(getCampaignProgress(planet).value).toBe("0.00");
  });
});

describe("isMoving", () => {
  const campaign = (planet: Planet) => ({
    id: 1,
    planet,
    faction: "Automaton",
  });

  it("counts region-only progress as moving", () => {
    const planet = makePlanet({
      regions: [{ name: "R", health: 90, maxHealth: 100, isAvailable: true }],
    });
    expect(isMoving(campaign(planet))).toBe(true);
  });

  it("treats a full-health planet with untouched regions as parked", () => {
    const planet = makePlanet({
      regions: [{ name: "R", health: 100, maxHealth: 100, isAvailable: true }],
    });
    expect(isMoving(campaign(planet))).toBe(false);
  });

  it("always counts a defense event as moving", () => {
    const planet = makePlanet({
      event: {
        id: 1,
        eventType: 1,
        faction: "Illuminate",
        health: 100,
        maxHealth: 100,
        startTime: "2026-01-01T00:00:00Z",
        endTime: "2026-01-02T00:00:00Z",
      },
    });
    expect(isMoving(campaign(planet))).toBe(true);
  });
});

describe("getPlanetStats", () => {
  it("calculates stats for a liberation planet", () => {
    const planet = {
      name: "Test",
      sector: "S1",
      position: { x: 0, y: 0 },
      health: 50,
      maxHealth: 100,
      regenPerSecond: 0,
      currentOwner: "Humans",
      initialOwner: "Humans",
      statistics: { playerCount: 0 },
    };
    const stats = getPlanetStats(planet);
    expect(stats.liberation).toBe("50.00");
    expect(stats.regen).toBe(0);
    expect(stats.status.text).toBe("Stable");
  });

  it("uses defense-remaining semantics for event planets (matches map)", () => {
    const planet = {
      name: "Defense",
      sector: "S1",
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      regenPerSecond: 5,
      currentOwner: "Humans",
      initialOwner: "Humans",
      statistics: { playerCount: 0 },
      event: {
        id: 1,
        eventType: 1,
        faction: "Automaton",
        health: 30,
        maxHealth: 100,
        startTime: "2026-01-01T00:00:00Z",
        endTime: "2026-01-02T00:00:00Z",
      },
    };
    const stats = getPlanetStats(planet);
    // inverse of health -> 30% defense remaining, same as campaign-map
    expect(stats.liberation).toBe("30.00");
    expect(stats.status.text).toBe("Defending");
    // Must be a semantic token: the badges look it up in STATUS_TEXT_CLASS and
    // a raw Tailwind class silently resolves to undefined.
    expect(STATUS_TEXT_CLASS[stats.status.color]).toBeDefined();
  });
});

describe("getEnemyKills", () => {
  it("returns null when no per-faction kill data is present", () => {
    expect(getEnemyKills({ playerCount: 5 })).toBeNull();
  });
  it("sums all present faction kills", () => {
    expect(
      getEnemyKills({
        playerCount: 5,
        terminidKills: 10,
        automatonKills: 20,
        illuminateKills: 5,
      }),
    ).toBe(35);
  });
  it("treats missing factions as zero when at least one is present", () => {
    expect(getEnemyKills({ playerCount: 5, terminidKills: 10 })).toBe(10);
  });
});

describe("getCampaignStats", () => {
  it("categorizes campaigns correctly", () => {
    const campaigns = [
      {
        id: 1,
        planet: {
          name: "Active1",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 50,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 10 },
        },
        faction: "Terminids",
      },
      {
        id: 2,
        planet: {
          name: "Liberated",
          sector: "S2",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 5 },
          event: null,
        },
        faction: "Automaton",
      },
    ];
    const stats = getCampaignStats(campaigns);
    expect(stats.activePlanets).toHaveLength(1);
    expect(stats.liberatedPlanets).toHaveLength(1);
    expect(stats.liberatedPlayerCount).toBe(5);
  });

  it("treats an enemy planet at full health as an active 0% campaign", () => {
    const campaigns = [
      {
        id: 1,
        planet: {
          name: "Fresh",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Automaton",
          initialOwner: "Humans",
          statistics: { playerCount: 22000 },
          event: null,
        },
        faction: "Automaton",
      },
    ];
    const stats = getCampaignStats(campaigns);
    expect(stats.activePlanets).toHaveLength(1);
    expect(stats.liberatedPlanets).toHaveLength(0);
    expect(stats.liberatedPlayerCount).toBe(0);
  });

  it("keeps an untouched defense event in the active list", () => {
    const campaigns = [
      {
        id: 1,
        planet: {
          name: "Defense",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 10 },
          event: {
            id: 1,
            eventType: 1,
            faction: "Automaton",
            health: 100,
            maxHealth: 100,
            startTime: "2026-01-01T00:00:00Z",
            endTime: "2026-01-02T00:00:00Z",
          },
        },
        faction: "Automaton",
      },
    ];
    const stats = getCampaignStats(campaigns);
    expect(stats.activePlanets).toHaveLength(1);
    expect(stats.liberatedPlanets).toHaveLength(0);
  });

  it("orders defenses first, then progress, then player draw", () => {
    const campaign = (planet: Planet) => ({
      id: planet.name,
      planet,
      faction: "Automaton",
    });
    const stats = getCampaignStats([
      campaign(
        makePlanet({ name: "Crowded", statistics: { playerCount: 9000 } }),
      ),
      campaign(makePlanet({ name: "Empty", statistics: { playerCount: 3 } })),
      campaign(makePlanet({ name: "Pushed", health: 20 })),
      campaign(
        makePlanet({
          name: "Defense",
          event: {
            id: 1,
            eventType: 1,
            faction: "Illuminate",
            health: 100,
            maxHealth: 100,
            startTime: "2026-01-01T00:00:00Z",
            endTime: "2026-01-02T00:00:00Z",
          },
        }),
      ),
    ]);

    expect(stats.activePlanets.map((c) => c.planet.name)).toEqual([
      "Defense",
      "Pushed",
      "Crowded",
      "Empty",
    ]);
  });

  it("splits fronts that have moved from fronts that have not", () => {
    const campaign = (planet: Planet) => ({
      id: planet.name,
      planet,
      faction: "Automaton",
    });
    const stats = getCampaignStats([
      campaign(makePlanet({ name: "Parked" })),
      campaign(
        makePlanet({
          name: "Region",
          regions: [
            { name: "City", health: 50, maxHealth: 100, isAvailable: true },
          ],
        }),
      ),
    ]);

    expect(stats.movingPlanets.map((c) => c.planet.name)).toEqual(["Region"]);
    expect(stats.parkedPlanets.map((c) => c.planet.name)).toEqual(["Parked"]);
    expect(stats.activePlanets).toHaveLength(2);
  });
});
