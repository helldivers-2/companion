import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import { DispatchDtoSchema, type DispatchDto } from "@/types/dispatches";

export async function fetchDispatches(): Promise<DispatchDto[]> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.DISPATCHES.url,
    revalidate: ENDPOINTS.DISPATCHES.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch dispatches: ${result.error.message}`);
  }
  return validate(z.array(DispatchDtoSchema), result.data, "dispatches");
}
