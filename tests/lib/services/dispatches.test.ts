import { describe, it, expect, vi } from "vitest";
import { fetchDispatches, fetchDispatch } from "@/lib/services/dispatches";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchDispatches", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      { id: 1, published: "2026-01-01", type: 0, message: "Hello" },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchDispatches();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchDispatches()).rejects.toThrow(
      "Failed to fetch dispatches",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: true,
      data: { notAnArray: true },
    });
    await expect(fetchDispatches()).rejects.toThrow("Invalid dispatches data");
  });
});

describe("fetchDispatch", () => {
  const dispatch = {
    id: 1,
    published: "2026-01-01",
    type: 0,
    message: "Hello",
  };

  it("requests the per-index endpoint", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: dispatch });
    const result = await fetchDispatch(1);
    expect(result).toEqual(dispatch);
    expect(getAPI).toHaveBeenCalledWith({
      url: ENDPOINTS.DISPATCH(1).url,
      revalidate: ENDPOINTS.DISPATCH(1).revalidate,
    });
  });

  it("throws on API failure with the index", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchDispatch(4)).rejects.toThrow(
      "Failed to fetch dispatch 4",
    );
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: [] });
    await expect(fetchDispatch(1)).rejects.toThrow("Invalid dispatch data");
  });
});
