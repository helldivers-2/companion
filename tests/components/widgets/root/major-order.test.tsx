import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getAssignments } from "@/lib/data/assignments";
import MajorOrder from "@/components/widgets/root/major-order";
import type { Assignment } from "@/types/assignments";

vi.mock("@/lib/data/assignments", () => ({
  getAssignments: vi.fn(),
}));

describe("MajorOrder", () => {
  it("renders an error state when assignments fail to load", async () => {
    vi.mocked(getAssignments).mockResolvedValue(null);

    const html = renderToStaticMarkup(await MajorOrder());

    expect(html).toContain("Unable to Load Major Orders");
  });

  it("renders an empty state when there are no active orders", async () => {
    vi.mocked(getAssignments).mockResolvedValue([]);

    const html = renderToStaticMarkup(await MajorOrder());

    expect(html).toContain("No Major Orders Active");
  });

  it("renders assignment briefing and progress", async () => {
    const assignments: Assignment[] = [
      {
        id: 1,
        briefing: "Liberate Malevelon Creek",
        expiration: new Date(Date.now() + 86400000).toISOString(),
        progress: [1, 0],
      },
    ];
    vi.mocked(getAssignments).mockResolvedValue(assignments);

    const html = renderToStaticMarkup(await MajorOrder());

    expect(html).toContain("Liberate Malevelon Creek");
    expect(html).toContain("50% Complete");
  });
});
