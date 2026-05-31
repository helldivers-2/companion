import { cache } from "react";
import { fetchAssignments } from "@/lib/services/assignments";
import { mapAssignmentDto } from "@/lib/transformers/assignments";
import type { Assignment } from "@/types/assignments";

async function _getAssignments(): Promise<Assignment[]> {
  try {
    const dtos = await fetchAssignments();
    return dtos.map(mapAssignmentDto);
  } catch (error) {
    console.error("getAssignments failed:", error);
    return [];
  }
}

export const getAssignments = cache(_getAssignments);
