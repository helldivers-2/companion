import { describe, it, expect } from "vitest";
import {
  getLiberation,
  getLiberationRate,
  getStatus,
  getTimeToLiberation,
  getPlanetStats,
  getCampaignStats,
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

describe("getLiberationRate", () => {
  it("calculates hourly rate", () => {
    const rate = getLiberationRate(0.01, 100);
    expect(rate).toBeCloseTo(-36, 1);
  });
  it("returns 0 for maxHealth 0", () => {
    expect(getLiberationRate(0.01, 0)).toBe(0);
  });
});

describe("getStatus", () => {
  it("returns Gaining Ground for positive rate", () => {
    expect(getStatus(1).text).toBe("Gaining Ground");
  });
  it("returns Losing Ground for negative rate", () => {
    expect(getStatus(-1).text).toBe("Losing Ground");
  });
  it("returns Stalemate for neutral rate", () => {
    expect(getStatus(0).text).toBe("Stalemate");
  });
});

describe("getTimeToLiberation", () => {
  it("returns null for non-positive rate", () => {
    expect(getTimeToLiberation(50, 0)).toBeNull();
    expect(getTimeToLiberation(50, -1)).toBeNull();
  });
  it("returns minutes for short time", () => {
    expect(getTimeToLiberation(50, 50)).toBe("1h 0m");
  });
  it("returns hours and minutes for longer time", () => {
    expect(getTimeToLiberation(50, 25)).toBe("2h 0m");
  });
});

describe("getPlanetStats", () => {
  it("calculates stats for a planet", () => {
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
    expect(stats.status.text).toBe("Stalemate");
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
