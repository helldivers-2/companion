import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getAssignment } from "@/lib/data/assignments";
import AssignmentPage from "@/app/assignment/[index]/page";

vi.mock("@/lib/data/assignments", () => ({
  getAssignment: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("AssignmentPage", () => {
  it("rejects a non-numeric index", async () => {
    await expect(
      AssignmentPage({ params: Promise.resolve({ index: "abc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects an unknown assignment", async () => {
    vi.mocked(getAssignment).mockResolvedValue(null);
    await expect(
      AssignmentPage({ params: Promise.resolve({ index: "1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the major order directive", async () => {
    vi.mocked(getAssignment).mockResolvedValue({
      id: 1,
      title: "MAJOR ORDER",
      briefing: "Decommission Automaton Troopers.",
      description: null,
      expiration: new Date(Date.now() + 86400000).toISOString(),
      progress: [1, 0],
      tasks: [],
    });

    const html = renderToStaticMarkup(
      await AssignmentPage({ params: Promise.resolve({ index: "1" }) }),
    );
    expect(html).toContain("MAJOR ORDER");
    expect(html).toContain("Decommission Automaton Troopers.");
    expect(html).toContain("1 of 2 objectives");
  });
});
