import { cache } from "react";
import { fetchPatchNotes, fetchPatchNote } from "@/lib/services/news";
import type { PatchNote } from "@/types/news";

async function _getPatchNotes(): Promise<PatchNote[] | null> {
  try {
    return await fetchPatchNotes();
  } catch (error) {
    console.error("getPatchNotes failed:", error);
    return null;
  }
}

async function _getPatchNote(gid: string): Promise<PatchNote | null> {
  try {
    return await fetchPatchNote(gid);
  } catch (error) {
    console.error(`getPatchNote(${gid}) failed:`, error);
    return null;
  }
}

export const getPatchNotes = cache(_getPatchNotes);
export const getPatchNote = cache(_getPatchNote);
