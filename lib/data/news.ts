import { cache } from "react";
import { fetchPatchNotes } from "@/lib/services/news";
import { mapPatchNoteDto } from "@/lib/transformers/news";
import type { PatchNote } from "@/types/news";

async function _getPatchNotes(): Promise<PatchNote[] | null> {
  try {
    const dtos = await fetchPatchNotes();
    return dtos.map(mapPatchNoteDto);
  } catch (error) {
    console.error("getPatchNotes failed:", error);
    return null;
  }
}

export const getPatchNotes = cache(_getPatchNotes);
