import { describe, it, expect, vi } from "vitest";
import { getWarStats, getWarInfo } from "@/lib/data/war";
import { fetchWarStats } from "@/lib/services/campaigns";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/campaigns", () => ({
  fetchWarStats: vi.fn(),
}));

describe("getWarStats", () => {
  it("returns mapped war stats", async () => {
    vi.mocked(fetchWarStats).mockResolvedValue({
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
    });

    const result = await getWarStats();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result.playerCount).toBe(1000);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchWarStats).mockRejectedValue(new Error("fail"));
    const result = await getWarStats();
    expect(result).toBeNull();
  });
});

describe("getWarInfo", () => {
  it("maps the full war state", async () => {
    vi.mocked(fetchWarStats).mockResolvedValue({
      started: "2024-01-23T20:05:13Z",
      factions: ["Humans", "Terminids"],
      impactMultiplier: 0.01,
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
    });

    const result = await getWarInfo();
    if (result === null) throw new Error("Expected result");
    expect(result.started).toBe("2024-01-23T20:05:13Z");
    expect(result.factions).toHaveLength(2);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchWarStats).mockRejectedValue(new Error("fail"));
    expect(await getWarInfo()).toBeNull();
  });
});
