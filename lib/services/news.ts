import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PatchNoteDto } from "@/types/news";

export async function fetchPatchNotes(): Promise<PatchNoteDto[]> {
  const result = await getAPI<PatchNoteDto[]>({
    url: ENDPOINTS.STEAM.url,
    revalidate: ENDPOINTS.STEAM.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch patch notes: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid patch notes data: expected array");
  }
  return result.data;
}
