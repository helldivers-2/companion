import { cache } from "react";
import { fetchWarStats } from "@/lib/services/campaigns";
import { mapWarStatsDto, mapWarDto } from "@/lib/transformers/war";
import type { WarStats, WarInfo } from "@/types/war";

async function _getWarStats(): Promise<WarStats | null> {
  try {
    const dto = await fetchWarStats();
    return mapWarStatsDto(dto);
  } catch (error) {
    console.error("getWarStats failed:", error);
    return null;
  }
}

async function _getWarInfo(): Promise<WarInfo | null> {
  try {
    const dto = await fetchWarStats();
    return mapWarDto(dto);
  } catch (error) {
    console.error("getWarInfo failed:", error);
    return null;
  }
}

export const getWarStats = cache(_getWarStats);
export const getWarInfo = cache(_getWarInfo);
