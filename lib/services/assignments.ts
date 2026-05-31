import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AssignmentDto } from "@/types/assignments";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  const result = await getAPI<AssignmentDto[]>({
    url: ENDPOINTS.ASSIGNMENTS.url,
    revalidate: ENDPOINTS.ASSIGNMENTS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch assignments: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid assignments data: expected array");
  }
  return result.data;
}
