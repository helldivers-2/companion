import type { PatchNoteDto, PatchNote } from "@/types/news";

export function mapPatchNoteDto(dto: PatchNoteDto): PatchNote {
  return { ...dto };
}
