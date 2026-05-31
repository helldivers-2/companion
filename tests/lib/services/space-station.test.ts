import { describe, it, expect, vi } from "vitest";
import { fetchSpaceStations } from "@/lib/services/space-station";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchSpaceStations", () => {
  it("returns DTOs on success", async () => {
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
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchSpaceStations();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchSpaceStations()).rejects.toThrow("Failed to fetch space stations");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchSpaceStations()).rejects.toThrow("Invalid space station data");
  });
});
