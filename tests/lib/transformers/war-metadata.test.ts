import { describe, it, expect } from "vitest";
import {
  mapWarInfoDto,
  mapWarStatusDto,
  mapWarSummaryDto,
  mapNewsFeedItems,
  getSupplyLines,
  getHomeWorlds,
  getAttackLines,
} from "@/lib/transformers/war-metadata";
import {
  getFactionFromRace,
  getRegionSizeLabel,
} from "@/types/war-metadata";

describe("getFactionFromRace", () => {
  it("maps the known ArrowHead race ids", () => {
    expect(getFactionFromRace(1)).toBe("Humans");
    expect(getFactionFromRace(2)).toBe("Terminids");
    expect(getFactionFromRace(3)).toBe("Automaton");
    expect(getFactionFromRace(4)).toBe("Illuminate");
  });

  it("falls back to Unknown", () => {
    expect(getFactionFromRace(99)).toBe("Unknown");
  });
});

describe("getRegionSizeLabel", () => {
  it("maps the region size enum", () => {
    expect(getRegionSizeLabel(0)).toBe("Settlement");
    expect(getRegionSizeLabel(3)).toBe("MegaCity");
  });

  it("returns null for unknown sizes", () => {
    expect(getRegionSizeLabel(9)).toBeNull();
  });
});

describe("getSupplyLines", () => {
  it("emits each undirected link once", () => {
    const lines = getSupplyLines([
      { index: 0, maxHealth: 1, waypoints: [1, 2] },
      { index: 1, maxHealth: 1, waypoints: [0] },
    ]);
    expect(lines).toEqual([
      { source: 0, target: 1 },
      { source: 0, target: 2 },
    ]);
  });

  it("drops self links", () => {
    expect(
      getSupplyLines([{ index: 5, maxHealth: 1, waypoints: [5] }]),
    ).toEqual([]);
  });
});

describe("getHomeWorlds", () => {
  it("expands homeworld indices with faction metadata", () => {
    const worlds = getHomeWorlds([{ race: 3, planetIndices: [260] }]);
    expect(worlds).toEqual([
      {
        index: 260,
        race: 3,
        faction: "Automaton",
        factionIcon: expect.any(String),
      },
    ]);
  });
});

describe("mapWarInfoDto", () => {
  it("builds waypoints, supply lines, homeworlds and region info", () => {
    const metadata = mapWarInfoDto({
      warId: 801,
      startDate: 1706040313,
      endDate: 1833653095,
      minimumClientVersion: "0.3.0",
      planetInfos: [
        {
          index: 0,
          maxHealth: 1000000,
          waypoints: [260],
          position: { x: 0, y: 0 },
        },
        { index: 260, maxHealth: 2000000, waypoints: [] },
      ],
      homeWorlds: [{ race: 3, planetIndices: [260] }],
      planetRegions: [
        {
          planetIndex: 0,
          regionIndex: 0,
          maxHealth: 600000,
          regionSize: 3,
          damageMultiplier: 1.5,
        },
      ],
    });

    expect(metadata.warId).toBe(801);
    expect(metadata.startDate).toBe("2024-01-23T20:05:13.000Z");
    expect(metadata.waypoints[0]).toEqual([260]);
    expect(metadata.supplyLines).toEqual([{ source: 0, target: 260 }]);
    expect(metadata.homeWorlds[0].faction).toBe("Automaton");
    expect(metadata.planetPositions[0]).toEqual({ x: 0, y: 0 });
    expect(metadata.regionInfo["0:0"]).toEqual({
      planetIndex: 0,
      regionIndex: 0,
      maxHealth: 600000,
      size: null,
      damageMultiplier: 1.5,
    });
  });
  it("tolerates missing optional arrays", () => {
    const metadata = mapWarInfoDto({
      warId: 1,
      planetInfos: [],
      homeWorlds: [],
      planetRegions: [],
    });
    expect(metadata.startDate).toBeNull();
    expect(metadata.minimumClientVersion).toBe("unknown");
    expect(metadata.supplyLines).toEqual([]);
  });
});

describe("mapWarStatusDto", () => {
  it("indexes owners, health, players and marks event planets", () => {
    const view = mapWarStatusDto({
      warId: 801,
      planetStatus: [
        { index: 0, owner: 1, health: 100, players: 5 },
        { index: 262, owner: 3, health: 50, players: 900 },
      ],
      planetAttacks: [{ source: 137, target: 180 }],
      planetEvents: [
        {
          id: 1,
          planetIndex: 262,
          health: 50,
          maxHealth: 100,
        },
      ],
      planetRegions: [],
    });

    expect(view.planetOwners[0]).toBe("Humans");
    expect(view.planetOwners[262]).toBe("Automaton");
    expect(view.planetPlayers[262]).toBe(900);
    expect(view.attacks).toEqual([{ source: 137, target: 180 }]);
    expect(view.eventPlanets.has(262)).toBe(true);
    expect(view.eventPlanets.has(0)).toBe(false);
  });
});

describe("mapWarSummaryDto", () => {
  it("indexes per-planet stats by planet index", () => {
    const summary = mapWarSummaryDto({
      galaxy_stats: {
        missionsWon: 1,
        missionsLost: 2,
        missionTime: 3,
        bugKills: 4,
        automatonKills: 5,
        illuminateKills: 6,
        bulletsFired: 7,
        bulletsHit: 8,
        timePlayed: 9,
        deaths: 10,
        friendlies: 11,
        missionSuccessRate: 12,
      },
      planets_stats: [
        {
          planetIndex: 7,
          missionsWon: 100,
          missionsLost: 2,
          missionTime: 3,
          bugKills: 4,
          automatonKills: 5,
          illuminateKills: 6,
          bulletsFired: 7,
          bulletsHit: 8,
          timePlayed: 9,
          deaths: 10,
          friendlies: 11,
          missionSuccessRate: 12,
        },
      ],
    });
    expect(summary.planets[7].missionsWon).toBe(100);
  });
});

describe("mapNewsFeedItems", () => {
  it("anchors Published to the war start date and sorts newest first", () => {
    const items = mapNewsFeedItems(
      [
        { Id: 1, Published: 0, Type: 0, Message: "oldest" },
        { Id: 2, Published: 86400, Type: 0, Message: "newer" },
      ],
      "2024-01-23T20:05:13.000Z",
    );
    expect(items[0].message).toBe("newer");
    expect(items[1].published).toBe("2024-01-23T20:05:13.000Z");
    expect(items[0].published).toBe("2024-01-24T20:05:13.000Z");
  });

  it("falls back to epoch when no start date is known", () => {
    const items = mapNewsFeedItems(
      [{ Id: 1, Published: 10, Type: 0, Message: "x" }],
      null,
    );
    expect(items[0].published).toBe("1970-01-01T00:00:00.000Z");
  });
});

describe("getAttackLines", () => {
  it("pairs attacks with planet coordinates", () => {
    const lines = getAttackLines([{ source: 1, target: 2 }], {
      1: { x: 0, y: 0 },
      2: { x: 1, y: 1 },
    });
    expect(lines).toEqual([{ from: { x: 0, y: 0 }, to: { x: 1, y: 1 } }]);
  });

  it("drops attacks whose endpoints lack coordinates", () => {
    const lines = getAttackLines([{ source: 1, target: 99 }], {
      1: { x: 0, y: 0 },
    });
    expect(lines).toEqual([]);
  });
});
