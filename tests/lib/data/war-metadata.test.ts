import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getWarId,
  getWarMetadata,
  getWarStatus,
  getGalaxySummary,
  getSuperEarthNews,
} from "@/lib/data/war-metadata";
import {
  fetchWarId,
  fetchWarInfo,
  fetchWarStatus,
  fetchWarSummary,
  fetchNewsFeed,
} from "@/lib/services/war-metadata";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/war-metadata", () => ({
  fetchWarId: vi.fn(),
  fetchWarInfo: vi.fn(),
  fetchWarStatus: vi.fn(),
  fetchWarSummary: vi.fn(),
  fetchNewsFeed: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const galaxyStats = {
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
  revives: 0,
  accurracy: 0,
};

describe("getWarId", () => {
  it("returns the id", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    expect(await getWarId()).toBe(801);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchWarId).mockRejectedValue(new Error("fail"));
    expect(await getWarId()).toBeNull();
  });
});

describe("getWarMetadata", () => {
  it("resolves the war id then maps the info", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarInfo).mockResolvedValue({
      warId: 801,
      planetInfos: [],
      homeWorlds: [],
      planetRegions: [],
    });

    const result = await getWarMetadata();
    if (result === null) throw new Error("Expected result");
    expect(result.warId).toBe(801);
    expect(fetchWarInfo).toHaveBeenCalledWith(801);
  });

  it("returns null when the war id cannot be resolved", async () => {
    vi.mocked(fetchWarId).mockRejectedValue(new Error("fail"));
    expect(await getWarMetadata()).toBeNull();
  });
});

describe("getWarStatus", () => {
  it("maps the status view", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarStatus).mockResolvedValue({
      warId: 801,
      planetStatus: [{ index: 1, owner: 1, health: 100, players: 5 }],
      planetAttacks: [],
      planetEvents: [],
      planetRegions: [],
    });

    const result = await getWarStatus();
    if (result === null) throw new Error("Expected result");
    expect(result.planetOwners[1]).toBe("Humans");
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarStatus).mockRejectedValue(new Error("fail"));
    expect(await getWarStatus()).toBeNull();
  });
});

describe("getGalaxySummary", () => {
  it("maps galaxy and planet stats", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarSummary).mockResolvedValue({
      galaxy_stats: galaxyStats,
      planets_stats: [{ planetIndex: 0, ...galaxyStats }],
    });

    const result = await getGalaxySummary();
    if (result === null) throw new Error("Expected result");
    expect(result.galaxy.missionsWon).toBe(1);
    expect(result.planets[0].missionsWon).toBe(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarSummary).mockRejectedValue(new Error("fail"));
    expect(await getGalaxySummary()).toBeNull();
  });
});

describe("getSuperEarthNews", () => {
  it("anchors news to the war start date", async () => {
    vi.mocked(fetchWarId).mockResolvedValue({ id: 801 });
    vi.mocked(fetchWarInfo).mockResolvedValue({
      warId: 801,
      startDate: 1706040313,
      planetInfos: [],
      homeWorlds: [],
      planetRegions: [],
    });
    vi.mocked(fetchNewsFeed).mockResolvedValue([
      { Id: 1, Published: 0, Type: 0, Message: "hello" },
    ]);

    const result = await getSuperEarthNews();
    if (result === null) throw new Error("Expected result");
    expect(result[0].published).toBe("2024-01-23T20:05:13.000Z");
  });

  it("returns null when the war id cannot be resolved", async () => {
    vi.mocked(fetchWarId).mockRejectedValue(new Error("fail"));
    expect(await getSuperEarthNews()).toBeNull();
  });
});
