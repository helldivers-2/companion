import { cache } from "react";
import { fetchPatchNotes } from "@/lib/services/news";
import type { PatchNote } from "@/types/news";

async function _getPatchNotes(): Promise<PatchNote[] | null> {
  try {
    return await fetchPatchNotes();
  } catch (error) {
    console.error("getPatchNotes failed:", error);
    return null;
  }
}

export const getPatchNotes = cache(_getPatchNotes);
