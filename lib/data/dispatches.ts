import { cache } from "react";
import { fetchDispatches, fetchDispatch } from "@/lib/services/dispatches";
import type { Dispatch } from "@/types/dispatches";

async function _getDispatches(): Promise<Dispatch[] | null> {
  try {
    return await fetchDispatches();
  } catch (error) {
    console.error("getDispatches failed:", error);
    return null;
  }
}

async function _getDispatch(index: number | string): Promise<Dispatch | null> {
  try {
    return await fetchDispatch(index);
  } catch (error) {
    console.error(`getDispatch(${index}) failed:`, error);
    return null;
  }
}

export const getDispatches = cache(_getDispatches);
export const getDispatch = cache(_getDispatch);
