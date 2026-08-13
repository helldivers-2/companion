import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDispatches } from "@/lib/data/dispatches";
import Dispatches from "@/components/widgets/root/dispatches";
import type { Dispatch } from "@/types/dispatches";

vi.mock("@/lib/data/dispatches", () => ({
  getDispatches: vi.fn(),
}));

describe("Dispatches", () => {
  it("renders an error state when dispatches fail to load", async () => {
    vi.mocked(getDispatches).mockResolvedValue(null);

    const html = renderToStaticMarkup(await Dispatches());

    expect(html).toContain("Unable to Load Dispatches");
  });

  it("renders an empty state when there are no dispatches", async () => {
    vi.mocked(getDispatches).mockResolvedValue([]);

    const html = renderToStaticMarkup(await Dispatches());

    expect(html).toContain("No dispatches available");
  });

  it("renders dispatch messages", async () => {
    const dispatches: Dispatch[] = [
      {
        id: 1,
        published: new Date().toISOString(),
        type: 0,
        message: "Super Earth High Command has issued a new directive.",
      },
    ];
    vi.mocked(getDispatches).mockResolvedValue(dispatches);

    const html = renderToStaticMarkup(await Dispatches());

    expect(html).toContain(
      "Super Earth High Command has issued a new directive.",
    );
  });
});
