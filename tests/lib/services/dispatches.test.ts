import { describe, it, expect, vi } from "vitest";
import { fetchDispatches } from "@/lib/services/dispatches";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchDispatches", () => {
  it("returns DTOs on success", async () => {
    const mock = [{ id: 1, published: "2026-01-01", type: 0, message: "Hello" }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchDispatches();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchDispatches()).rejects.toThrow("Failed to fetch dispatches");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: { notAnArray: true } });
    await expect(fetchDispatches()).rejects.toThrow("Invalid dispatches data");
  });
});
