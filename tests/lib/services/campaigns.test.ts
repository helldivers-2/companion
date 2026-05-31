import { describe, it, expect, vi } from "vitest";
import { fetchCampaigns, fetchWarStats } from "@/lib/services/campaigns";
import { getAPI } from "@/lib/api/client";

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
  it("returns DTO on success", async () => {
    const mock = { statistics: { playerCount: 1000 } };
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
});
