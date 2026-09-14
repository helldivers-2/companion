import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import { PatchNoteDtoSchema, type PatchNoteDto } from "@/types/news";

export async function fetchPatchNotes(): Promise<PatchNoteDto[]> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.STEAM.url,
    revalidate: ENDPOINTS.STEAM.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch patch notes: ${result.error.message}`);
  }
  return validate(z.array(PatchNoteDtoSchema), result.data, "patch notes");
}

// The /v1/steam/{gid} endpoint returns an array even for a single item, and
// responds 404 for an unknown gid; both are handled by the caller turning a
// failure into null.
export async function fetchPatchNote(gid: string): Promise<PatchNoteDto | null> {
  const endpoint = ENDPOINTS.STEAM_ITEM(gid);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    return null;
  }
  return validate(z.array(PatchNoteDtoSchema), result.data, "patch note")[0] ?? null;
}
