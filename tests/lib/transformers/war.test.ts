import { describe, it, expect } from "vitest";
import { mapWarStatsDto } from "@/lib/transformers/war";

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
