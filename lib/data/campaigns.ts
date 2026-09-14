import { cache } from "react";
import { fetchCampaigns, fetchCampaign } from "@/lib/services/campaigns";
import {
  mapCampaignDto,
  getCampaignStats,
  getCampaignSupplyLines,
} from "@/lib/transformers/campaigns";
import type { Campaign, CampaignStats } from "@/types/campaigns";

export interface CampaignData extends CampaignStats {
  supplyLines: ReturnType<typeof getCampaignSupplyLines>;
}

async function _getCampaignData(): Promise<CampaignData | null> {
  try {
    const dtos = await fetchCampaigns();
    const campaigns = dtos.map(mapCampaignDto);
    return {
      ...getCampaignStats(campaigns),
      supplyLines: getCampaignSupplyLines(campaigns),
    };
  } catch (error) {
    console.error("getCampaignData failed:", error);
    return null;
  }
}

async function _getCampaign(index: number | string): Promise<Campaign | null> {
  try {
    const dto = await fetchCampaign(index);
    return mapCampaignDto(dto);
  } catch (error) {
    console.error(`getCampaign(${index}) failed:`, error);
    return null;
  }
}

export const getCampaignData = cache(_getCampaignData);
export const getCampaign = cache(_getCampaign);
