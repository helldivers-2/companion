import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAPI } from "@/lib/api/client";

beforeEach(() => {
  vi.restoreAllMocks();
});

const ok = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;

const throttled = (retryAfter: string) =>
  ({
    ok: false,
    status: 429,
    statusText: "",
    headers: {
      get: (name: string) => (name === "retry-after" ? retryAfter : null),
    },
  }) as unknown as Response;

describe("getAPI", () => {
  it("returns success on valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ foo: "bar" }));

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
      expect(result.error.message).toBe(
        "API /test returned HTTP 500: Internal Server Error",
      );
    }
  });

  it("omits the empty reason phrase of HTTP/2 responses", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "",
    } as Response);

    const result = await getAPI({ url: "/test" });
    if (result.success) throw new Error("Expected failure");
    expect(result.error.message).toBe("API /test returned HTTP 404");
  });

  it("shares one request between identical concurrent calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: "ok" }));
    global.fetch = fetchMock;

    const [a, b] = await Promise.all([
      getAPI({ url: "/shared", revalidate: 600 }),
      getAPI({ url: "/shared", revalidate: 600 }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);

    await getAPI({ url: "/shared", revalidate: 600 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns error on fetch exception", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Network error");
    }
  });

  describe("when throttled", () => {
    // The throttle window is module state, so each test loads a fresh client
    // rather than inheriting the window a previous test left open.
    let getAPI: typeof import("@/lib/api/client").getAPI;

    beforeEach(async () => {
      vi.useFakeTimers({ now: 0 });
      vi.resetModules();
      ({ getAPI } = await import("@/lib/api/client"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("waits out retry-after and retries", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(throttled("10"))
        .mockResolvedValueOnce(ok({ data: "ok" }));
      global.fetch = fetchMock;

      const pending = getAPI({ url: "/retry" });
      await vi.advanceTimersByTimeAsync(9_999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      const result = await pending;
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it("holds other requests until the throttle window resets", async () => {
      const fetchMock = vi.fn((url: string) =>
        Promise.resolve(
          url.endsWith("/first") && fetchMock.mock.calls.length === 1
            ? throttled("5")
            : ok({ url }),
        ),
      );
      global.fetch = fetchMock as unknown as typeof fetch;

      const first = getAPI({ url: "/first" });
      await vi.advanceTimersByTimeAsync(0);
      const second = getAPI({ url: "/second" });
      await vi.advanceTimersByTimeAsync(4_999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect((await first).success).toBe(true);
      expect((await second).success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("gives up after repeated 429s", async () => {
      const fetchMock = vi.fn().mockResolvedValue(throttled("1"));
      global.fetch = fetchMock;

      const pending = getAPI({ url: "/busy" });
      await vi.advanceTimersByTimeAsync(10_000);
      const result = await pending;
      expect(fetchMock).toHaveBeenCalledTimes(4);
      if (result.success) throw new Error("Expected failure");
      expect(result.error.message).toBe("API /busy returned HTTP 429");
    });
  });
});
