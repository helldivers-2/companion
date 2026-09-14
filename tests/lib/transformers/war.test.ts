import { describe, it, expect } from "vitest";
import { mapWarStatsDto, mapWarDto } from "@/lib/transformers/war";

describe("mapWarStatsDto", () => {
  it("maps statistics fields", () => {
    const dto = {
      statistics: {
        playerCount: 1000,
        missionSuccessRate: 50,
        missionsWon: 100,
        missionTime: 3600,
        terminidKills: 1000,
        automatonKills: 500,
        illuminateKills: 100,
        bulletsFired: 10000,
        deaths: 50,
        friendlies: 10,
        missionsLost: 5,
      },
    };
    const result = mapWarStatsDto(dto);
    expect(result.playerCount).toBe(1000);
    expect(result.missionSuccessRate).toBe(50);
  });
});

describe("mapWarDto", () => {
  it("maps the full war state alongside statistics", () => {
    const dto = {
      started: "2024-01-23T20:05:13Z",
      ended: "2028-02-08T20:04:55Z",
      now: "2026-09-14T00:00:00Z",
      clientVersion: "0.3.0",
      factions: ["Humans", "Terminids", "Automaton", "Illuminate"],
      impactMultiplier: 0.014,
      statistics: {
        playerCount: 1000,
        missionSuccessRate: 50,
        missionsWon: 100,
        missionTime: 3600,
        terminidKills: 1000,
        automatonKills: 500,
        illuminateKills: 100,
        bulletsFired: 10000,
        deaths: 50,
        friendlies: 10,
        missionsLost: 5,
      },
    };
    const result = mapWarDto(dto);
    expect(result.started).toBe("2024-01-23T20:05:13Z");
    expect(result.factions).toHaveLength(4);
    expect(result.impactMultiplier).toBe(0.014);
    expect(result.statistics.playerCount).toBe(1000);
  });

  it("defaults absent optional metadata", () => {
    const result = mapWarDto({
      statistics: {
        playerCount: 1,
        missionSuccessRate: 1,
        missionsWon: 1,
        missionTime: 1,
        terminidKills: 1,
        automatonKills: 1,
        illuminateKills: 1,
        bulletsFired: 1,
        deaths: 1,
        friendlies: 1,
        missionsLost: 1,
      },
    });
    expect(result.started).toBeNull();
    expect(result.factions).toEqual([]);
    expect(result.impactMultiplier).toBeNull();
  });
});
