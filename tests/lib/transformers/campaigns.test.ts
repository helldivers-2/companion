import { describe, it, expect } from "vitest";
import {
  getLiberation,
  getRegenRate,
  getStatus,
  getPlanetStats,
  getCampaignStats,
  getEnemyKills,
  mapPlanetDto,
  mapCampaignDto,
  species,
} from "@/lib/transformers/campaigns";

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
  it("returns Regenerating for meaningful regen", () => {
    expect(getStatus(1).text).toBe("Regenerating");
  });
  it("returns Stable for negligible regen", () => {
    expect(getStatus(0).text).toBe("Stable");
    expect(getStatus(0.5).text).toBe("Stable");
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
});
