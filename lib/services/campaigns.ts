import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import { CampaignDtoSchema, type CampaignDto } from "@/types/campaigns";
import { WarStatsDtoSchema, type WarStatsDto } from "@/types/war";

export async function fetchCampaigns(): Promise<CampaignDto[]> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.CAMPAIGNS.url,
    revalidate: ENDPOINTS.CAMPAIGNS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch campaigns: ${result.error.message}`);
  }
  return validate(z.array(CampaignDtoSchema), result.data, "campaigns");
}

export async function fetchWarStats(): Promise<WarStatsDto> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.WAR.url,
    revalidate: ENDPOINTS.WAR.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war stats: ${result.error.message}`);
  }
  return validate(WarStatsDtoSchema, result.data, "war stats");
}
