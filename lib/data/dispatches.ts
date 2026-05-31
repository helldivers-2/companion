import { cache } from "react";
import { fetchDispatches } from "@/lib/services/dispatches";
import { mapDispatchDto } from "@/lib/transformers/dispatches";
import type { Dispatch } from "@/types/dispatches";

async function _getDispatches(): Promise<Dispatch[] | null> {
  try {
    const dtos = await fetchDispatches();
    return dtos.map(mapDispatchDto);
  } catch (error) {
    console.error("getDispatches failed:", error);
    return null;
  }
}

export const getDispatches = cache(_getDispatches);
