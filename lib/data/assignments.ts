import { cache } from "react";
import { fetchAssignments, fetchAssignment } from "@/lib/services/assignments";
import { mapAssignmentDto } from "@/lib/transformers/assignments";
import type { Assignment } from "@/types/assignments";

async function _getAssignments(): Promise<Assignment[] | null> {
  try {
    const dtos = await fetchAssignments();
    return dtos.map(mapAssignmentDto);
  } catch (error) {
    console.error("getAssignments failed:", error);
    return null;
  }
}

async function _getAssignment(index: number | string): Promise<Assignment | null> {
  try {
    const dto = await fetchAssignment(index);
    return mapAssignmentDto(dto);
  } catch (error) {
    console.error(`getAssignment(${index}) failed:`, error);
    return null;
  }
}

export const getAssignments = cache(_getAssignments);
export const getAssignment = cache(_getAssignment);
