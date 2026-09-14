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

// The /v1/steam/{gid} endpoint now returns the item as a bare object; it used to
// wrap it in an array, so both shapes are accepted. An unknown gid responds 404,
// which becomes null here.
const PatchNoteItemSchema = z.union([
  PatchNoteDtoSchema,
  z.array(PatchNoteDtoSchema),
]);

export async function fetchPatchNote(
  gid: string,
): Promise<PatchNoteDto | null> {
  const endpoint = ENDPOINTS.STEAM_ITEM(gid);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    return null;
  }
  const data = validate(PatchNoteItemSchema, result.data, "patch note");
  return Array.isArray(data) ? (data[0] ?? null) : data;
}
