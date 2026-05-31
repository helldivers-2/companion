import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DispatchDto } from "@/types/dispatches";

export async function fetchDispatches(): Promise<DispatchDto[]> {
  const result = await getAPI<DispatchDto[]>({
    url: ENDPOINTS.DISPATCHES.url,
    revalidate: ENDPOINTS.DISPATCHES.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch dispatches: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid dispatches data: expected array");
  }
  return result.data;
}
