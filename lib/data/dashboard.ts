import { cache } from "react";
import { getCampaignData } from "./campaigns";
import { getWarStats } from "./war";

export interface DashboardData {
  playerCount: number;
  activeCount: number;
  eventCount: number;
  liberatedCount: number;
}

async function _getDashboardStats(): Promise<DashboardData> {
  try {
    const [warStats, campaignStats] = await Promise.all([
      getWarStats(),
      getCampaignData(),
    ]);

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
    return {
      playerCount: 0,
      activeCount: 0,
      eventCount: 0,
      liberatedCount: 0,
    };
  }
}

export const getDashboardStats = cache(_getDashboardStats);
