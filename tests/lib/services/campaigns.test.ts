import { describe, it, expect, vi } from "vitest";
import {
  fetchCampaigns,
  fetchWarStats,
  fetchCampaign,
} from "@/lib/services/campaigns";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchCampaigns", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      {
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
          statistics: { playerCount: 100 },
        },
        faction: "Terminids",
      },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchCampaigns();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchCampaigns()).rejects.toThrow("Failed to fetch campaigns");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchCampaigns()).rejects.toThrow("Invalid campaigns data");
  });
});

describe("fetchWarStats", () => {
  const validStats = {
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
  };

  it("returns DTO on success", async () => {
    const mock = { statistics: validStats };
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchWarStats();
    expect(result.statistics.playerCount).toBe(1000);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchWarStats()).rejects.toThrow("Failed to fetch war stats");
  });

  it("throws when statistics object is absent", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: {} });
    await expect(fetchWarStats()).rejects.toThrow("Invalid war stats data");
  });

  it("throws when required statistics fields are missing", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: true,
      data: { statistics: { playerCount: 1000 } },
    });
    await expect(fetchWarStats()).rejects.toThrow("Invalid war stats data");
  });
});

describe("fetchCampaign", () => {
  const campaign = {
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
      statistics: { playerCount: 100 },
    },
    faction: "Terminids",
  };

  it("requests the per-index endpoint", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: campaign });
    const result = await fetchCampaign(1);
    expect(result).toEqual(campaign);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.CAMPAIGN(1).url,
      revalidate: ENDPOINTS.CAMPAIGN(1).revalidate,
    });
  });

  it("throws on API failure with the index", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchCampaign(3)).rejects.toThrow(
      "Failed to fetch campaign 3",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [] });
    await expect(fetchCampaign(1)).rejects.toThrow("Invalid campaign data");
  });
});
