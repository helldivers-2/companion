import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDispatch } from "@/lib/data/dispatches";
import DispatchPage from "@/app/dispatch/[id]/page";

vi.mock("@/lib/data/dispatches", () => ({
  getDispatch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("DispatchPage", () => {
  it("rejects a non-numeric id", async () => {
    await expect(
      DispatchPage({ params: Promise.resolve({ id: "abc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects an unknown dispatch", async () => {
    vi.mocked(getDispatch).mockResolvedValue(null);
    await expect(
      DispatchPage({ params: Promise.resolve({ id: "1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the dispatch message", async () => {
    vi.mocked(getDispatch).mockResolvedValue({
      id: 1,
      published: new Date().toISOString(),
      type: 0,
      message: "NEW MAJOR ORDER: hold the line.",
    });

    const html = renderToStaticMarkup(
      await DispatchPage({ params: Promise.resolve({ id: "1" }) }),
    );
    expect(html).toContain("Dispatch #1");
    expect(html).toContain("New Order");
    expect(html).toContain("hold the line");
  });
});
