import { describe, it, expect, vi } from "vitest";
import { getPatchNotes } from "@/lib/data/news";
import PatchNotes from "@/components/widgets/news/newsfeed";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";
import type { PatchNote } from "@/types/news";

vi.mock("@/lib/data/news", () => ({
  getPatchNotes: vi.fn(),
}));

function makeNote(overrides: Partial<PatchNote>): PatchNote {
  return {
    id: "1",
    title: "Patch",
    url: "https://example.com",
    author: "Arrowhead",
    content: "Notes",
    publishedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("PatchNotes", () => {
  it("passes null through when notes fail to load", async () => {
    vi.mocked(getPatchNotes).mockResolvedValue(null);

    const element = await PatchNotes();

    expect(element.type).toBe(PatchNotesList);
    expect(element.props.notes).toBeNull();
  });

  it("sorts notes newest first", async () => {
    const older = makeNote({ id: "old", publishedAt: "2026-01-01T00:00:00Z" });
    const newer = makeNote({ id: "new", publishedAt: "2026-02-01T00:00:00Z" });
    vi.mocked(getPatchNotes).mockResolvedValue([older, newer]);

    const element = await PatchNotes();

    expect(element.props.notes.map((n: PatchNote) => n.id)).toEqual([
      "new",
      "old",
    ]);
  });
});
