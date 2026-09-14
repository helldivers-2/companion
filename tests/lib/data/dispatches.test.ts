import { describe, it, expect, vi } from "vitest";
import { getDispatches, getDispatch } from "@/lib/data/dispatches";
import { fetchDispatches, fetchDispatch } from "@/lib/services/dispatches";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/dispatches", () => ({
  fetchDispatches: vi.fn(),
  fetchDispatch: vi.fn(),
}));

describe("getDispatches", () => {
  it("returns mapped dispatches", async () => {
    const mock = [
      { id: 1, published: "2026-01-01", type: 0, message: "Hello" },
    ];
    vi.mocked(fetchDispatches).mockResolvedValue(mock);

    const result = await getDispatches();
    if (result === null) throw new Error("Expected result to be defined");
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Hello");
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchDispatches).mockRejectedValue(new Error("fail"));
    const result = await getDispatches();
    expect(result).toBeNull();
  });
});

describe("getDispatch", () => {
  it("maps a single dispatch", async () => {
    vi.mocked(fetchDispatch).mockResolvedValue({
      id: 1,
      published: "2026-01-01",
      type: 0,
      message: "Hello",
    });

    const result = await getDispatch(1);
    if (result === null) throw new Error("Expected result");
    expect(result.message).toBe("Hello");
    expect(fetchDispatch).toHaveBeenCalledWith(1);
  });

  it("returns null on failure", async () => {
    vi.mocked(fetchDispatch).mockRejectedValue(new Error("fail"));
    expect(await getDispatch(1)).toBeNull();
  });
});
