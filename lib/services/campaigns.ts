import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CampaignDto } from "@/types/campaigns";
import type { WarStatsDto } from "@/types/war";

export async function fetchCampaigns(): Promise<CampaignDto[]> {
  const result = await getAPI<CampaignDto[]>({
    url: ENDPOINTS.CAMPAIGNS.url,
    revalidate: ENDPOINTS.CAMPAIGNS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch campaigns: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid campaigns data: expected array");
  }
  return result.data;
}

export async function fetchWarStats(): Promise<WarStatsDto> {
  const result = await getAPI<WarStatsDto>({
    url: ENDPOINTS.WAR.url,
    revalidate: ENDPOINTS.WAR.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war stats: ${result.error.message}`);
  }
  return result.data;
}
