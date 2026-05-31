import { cache } from "react";
import { getCampaignData } from "./campaigns";
import { getWarStats } from "./war";

export interface DashboardData {
  playerCount: number;
  activeCount: number;
  eventCount: number;
  liberatedCount: number;
}

async function _getDashboardStats(): Promise<DashboardData | null> {
  try {
    const [warStats, campaignStats] = await Promise.all([
      getWarStats(),
      getCampaignData(),
    ]);

    if (!warStats || !campaignStats) {
      return null;
    }

    return {
      playerCount: warStats.playerCount,
      activeCount: campaignStats.activePlanets.length,
      eventCount: campaignStats.activePlanets.filter(
        (c) => c.planet.event != null,
      ).length,
      liberatedCount: campaignStats.liberatedPlanets.length,
    };
  } catch (error) {
    console.error("getDashboardStats failed:", error);
    return null;
  }
}

export const getDashboardStats = cache(_getDashboardStats);
