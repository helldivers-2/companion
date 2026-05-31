import { cache } from "react";
import { fetchWarStats } from "@/lib/services/campaigns";
import { mapWarStatsDto } from "@/lib/transformers/war";
import type { WarStats } from "@/types/war";

async function _getWarStats(): Promise<WarStats | null> {
  try {
    const dto = await fetchWarStats();
    return mapWarStatsDto(dto);
  } catch (error) {
    console.error("getWarStats failed:", error);
    return null;
  }
}

export const getWarStats = cache(_getWarStats);
