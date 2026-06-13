import { describe, it, expect, vi } from "vitest";
import { getSpaceStations } from "@/lib/data/space-station";
import { fetchSpaceStations } from "@/lib/services/space-station";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/space-station", () => ({
  fetchSpaceStations: vi.fn(),
}));

describe("getSpaceStations", () => {
  it("returns mapped stations", async () => {
    const mock = [
      {
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
        tacticalActions: [],
      },
    ];
    vi.mocked(fetchSpaceStations).mockResolvedValue(mock);

    const result = await getSpaceStations();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result).toHaveLength(1);
    expect(result[0].id32).toBe(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchSpaceStations).mockRejectedValue(new Error("fail"));
    const result = await getSpaceStations();
    expect(result).toBeNull();
  });
});
