import { describe, it, expect, vi } from "vitest";
import {
  fetchWarId,
  fetchWarInfo,
  fetchWarStatus,
  fetchWarSummary,
  fetchNewsFeed,
} from "@/lib/services/war-metadata";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchWarId", () => {
  it("returns the war id", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: { id: 801 } });
    expect(await fetchWarId()).toEqual({ id: 801 });
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchWarId()).rejects.toThrow("Failed to fetch war id");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: {} });
    await expect(fetchWarId()).rejects.toThrow("Invalid war id data");
  });
});

const validWarInfo = {
  warId: 801,
  planetInfos: [
    { index: 0, maxHealth: 1000000, waypoints: [1, 2] },
    { index: 1, maxHealth: 200000, waypoints: [] },
  ],
  homeWorlds: [{ race: 1, planetIndices: [0] }],
  planetRegions: [
    { planetIndex: 0, regionIndex: 0, maxHealth: 600000, regionSize: 3 },
  ],
};

describe("fetchWarInfo", () => {
  it("requests the season-scoped endpoint", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: validWarInfo });
    const result = await fetchWarInfo(801);
    expect(result.warId).toBe(801);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.WAR_INFO(801).url,
      revalidate: ENDPOINTS.WAR_INFO(801).revalidate,
    });
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchWarInfo(801)).rejects.toThrow("Failed to fetch war info");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: { warId: 801 } });
    await expect(fetchWarInfo(801)).rejects.toThrow("Invalid war info data");
  });
});

describe("fetchWarStatus", () => {
  it("returns the status payload", async () => {
    const mock = {
      warId: 801,
      planetStatus: [{ index: 0, owner: 1, health: 100, players: 5 }],
    };
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });
    const result = await fetchWarStatus(801);
    expect(result.warId).toBe(801);
  });

  it("defaults missing arrays to empty", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: true,
      data: { warId: 801 },
    });
    const result = await fetchWarStatus(801);
    expect(result.planetStatus).toEqual([]);
    expect(result.planetAttacks).toEqual([]);
    expect(result.planetEvents).toEqual([]);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchWarStatus(801)).rejects.toThrow(
      "Failed to fetch war status",
    );
  });
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
};

describe("fetchWarSummary", () => {
  it("returns galaxy and planet stats", async () => {
    const mock = {
      galaxy_stats: galaxyStats,
      planets_stats: [{ planetIndex: 0, ...galaxyStats }],
    };
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });
    const result = await fetchWarSummary(801);
    expect(result.galaxy_stats.missionsWon).toBe(1);
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: {} });
    await expect(fetchWarSummary(801)).rejects.toThrow(
      "Invalid war summary data",
    );
  });
});

describe("fetchNewsFeed", () => {
  it("returns the PascalCase news items", async () => {
    const mock = [{ Id: 1, Published: 100, Type: 0, Message: "hi" }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });
    const result = await fetchNewsFeed(801);
    expect(result[0].Message).toBe("hi");
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchNewsFeed(801)).rejects.toThrow(
      "Failed to fetch newsfeed",
    );
  });
});
