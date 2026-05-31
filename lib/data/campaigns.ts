import { cache } from "react";
import { fetchCampaigns } from "@/lib/services/campaigns";
import { mapCampaignDto, getCampaignStats } from "@/lib/transformers/campaigns";
import type { CampaignStats } from "@/types/campaigns";

async function _getCampaignData(): Promise<CampaignStats> {
  try {
    const dtos = await fetchCampaigns();
    const campaigns = dtos.map(mapCampaignDto);
    return getCampaignStats(campaigns);
  } catch (error) {
    console.error("getCampaignData failed:", error);
    return {
      campaigns: [],
      activePlanets: [],
      liberatedPlanets: [],
      liberatedPlayerCount: 0,
    };
  }
}

export const getCampaignData = cache(_getCampaignData);
