import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import { AssignmentDtoSchema, type AssignmentDto } from "@/types/assignments";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.ASSIGNMENTS.url,
    revalidate: ENDPOINTS.ASSIGNMENTS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch assignments: ${result.error.message}`);
  }
  return validate(z.array(AssignmentDtoSchema), result.data, "assignments");
}
