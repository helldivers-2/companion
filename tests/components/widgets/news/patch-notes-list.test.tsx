import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";
import type { PatchNote } from "@/types/news";

describe("PatchNotesList", () => {
  it("renders an error state when notes is null", () => {
    const html = renderToStaticMarkup(<PatchNotesList notes={null} />);

    expect(html).toContain("Unable to Load Newsfeed");
  });

  it("renders an empty state when there are no notes", () => {
    const html = renderToStaticMarkup(<PatchNotesList notes={[]} />);

    expect(html).toContain("No newsfeed items found");
  });

  it("renders note titles and total count", () => {
    const notes: PatchNote[] = [
      {
        id: "1",
        title: "Balance Update",
        url: "https://example.com",
        author: "Arrowhead",
        content: "[h1]Changes[/h1] Buffed the liberator.",
        publishedAt: new Date().toISOString(),
      },
    ];

    const html = renderToStaticMarkup(<PatchNotesList notes={notes} />);

    expect(html).toContain("Balance Update");
    expect(html).toContain("1 total");
  });
});
