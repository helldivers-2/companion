import { describe, it, expect } from "vitest";
import { mapSpaceStationDto } from "@/lib/transformers/space-station";

describe("mapSpaceStationDto", () => {
  it("maps all fields", () => {
    const dto = {
      id32: 1,
      planet: {
        name: "Test",
        sector: "S1",
        position: { x: 0, y: 0 },
        health: 100,
        maxHealth: 100,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
      electionEnd: "2026-01-01",
      flags: 0,
      tacticalActions: [
        {
          id32: 1,
          name: "Action",
          description: "Desc",
          strategicDescription: "Strat",
          status: 1,
          statusExpire: "2026-01-01",
          costs: [
            { id: "c1", targetValue: 100, currentValue: 50, deltaPerSecond: 0 },
          ],
        },
      ],
    };

    const result = mapSpaceStationDto(dto);
    expect(result.id32).toBe(1);
    expect(result.planet.name).toBe("Test");
    expect(result.tacticalActions).toHaveLength(1);
    expect(result.tacticalActions[0].costs[0].currentValue).toBe(50);
  });
});
