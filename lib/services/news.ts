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
