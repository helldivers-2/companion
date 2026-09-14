import { describe, it, expect, vi } from "vitest";
import {
  fetchPlanets,
  fetchPlanetEvents,
  fetchPlanet,
} from "@/lib/services/planets";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

const planet = {
  index: 1,
  name: "Test",
  sector: "S1",
  position: { x: 0, y: 0 },
  health: 50,
  maxHealth: 100,
  regenPerSecond: 0,
  currentOwner: "Humans",
  initialOwner: "Humans",
  statistics: { playerCount: 100 },
};

describe("fetchPlanets", () => {
  it("requests the planet list endpoint and returns DTOs", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [planet] });

    const result = await fetchPlanets();
    expect(result).toEqual([planet]);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.PLANETS.url,
      revalidate: ENDPOINTS.PLANETS.revalidate,
    });
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPlanets()).rejects.toThrow("Failed to fetch planets");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "nope" });
    await expect(fetchPlanets()).rejects.toThrow("Invalid planets data");
  });
});

describe("fetchPlanetEvents", () => {
  it("requests the events endpoint and returns DTOs", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [planet] });

    const result = await fetchPlanetEvents();
    expect(result).toEqual([planet]);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.PLANET_EVENTS.url,
      revalidate: ENDPOINTS.PLANET_EVENTS.revalidate,
    });
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPlanetEvents()).rejects.toThrow(
      "Failed to fetch planet events",
    );
  });
});

describe("fetchPlanet", () => {
  it("requests the per-index endpoint and returns the DTO", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: planet });

    const result = await fetchPlanet(42);
    expect(result).toEqual(planet);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.PLANET(42).url,
      revalidate: ENDPOINTS.PLANET(42).revalidate,
    });
  });

  it("throws on API failure with the index in the message", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPlanet(7)).rejects.toThrow("Failed to fetch planet 7");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [] });
    await expect(fetchPlanet(7)).rejects.toThrow("Invalid planet data");
  });
});
