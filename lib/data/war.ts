import { cache } from "react";
import { fetchWarStats } from "@/lib/services/campaigns";
import { mapWarStatsDto } from "@/lib/transformers/war";
import type { WarStats } from "@/types/war";

async function _getWarStats(): Promise<WarStats> {
  try {
    const dto = await fetchWarStats();
    return mapWarStatsDto(dto);
  } catch (error) {
    console.error("getWarStats failed:", error);
    return {
      playerCount: 0,
      missionSuccessRate: 0,
      missionsWon: 0,
      missionTime: 0,
      terminidKills: 0,
      automatonKills: 0,
      illuminateKills: 0,
      bulletsFired: 0,
      deaths: 0,
      friendlies: 0,
      missionsLost: 0,
    };
  }
}

export const getWarStats = cache(_getWarStats);
