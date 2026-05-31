import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAPI } from "@/lib/api/client";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getAPI", () => {
  it("returns success on valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ foo: "bar" }),
    } as Response);

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ foo: "bar" });
    }
  });

  it("returns error on HTTP failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("500");
    }
  });

  it("retries once on 429 and succeeds", async () => {
    const fetchMock = vi.fn();
    fetchMock
      .mockResolvedValueOnce({
        status: 429,
        headers: { get: (name: string) => (name === "retry-after" ? "1" : null) },
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "ok" }),
      } as Response);

    global.fetch = fetchMock;

    const result = await getAPI({ url: "/test" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it("returns error on fetch exception", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Network error");
    }
  });
});
