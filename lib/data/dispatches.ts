import { cache } from "react";
import { fetchDispatches } from "@/lib/services/dispatches";
import type { Dispatch } from "@/types/dispatches";

async function _getDispatches(): Promise<Dispatch[] | null> {
  try {
    return await fetchDispatches();
  } catch (error) {
    console.error("getDispatches failed:", error);
    return null;
  }
}

export const getDispatches = cache(_getDispatches);
