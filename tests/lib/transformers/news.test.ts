import { describe, it, expect } from "vitest";
import { mapPatchNoteDto } from "@/lib/transformers/news";
import type { PatchNoteDto } from "@/types/news";

describe("mapPatchNoteDto", () => {
  it("maps all fields", () => {
    const dto: PatchNoteDto = {
      id: "1",
      title: "Patch",
      url: "http://example.com",
      author: "Dev",
      content: "Fixes",
      publishedAt: "2026-01-01",
    };

    const result = mapPatchNoteDto(dto);

    expect(result.id).toBe("1");
    expect(result.title).toBe("Patch");
    expect(result.url).toBe("http://example.com");
    expect(result.author).toBe("Dev");
    expect(result.content).toBe("Fixes");
    expect(result.publishedAt).toBe("2026-01-01");
  });
});
