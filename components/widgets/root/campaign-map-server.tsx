import { getCampaignData } from "@/lib/data/campaigns";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";
import type { CampaignMapProps } from "@/components/widgets/root/campaign-map";

const ERROR_MESSAGE = "Failed to load campaign data. Please try again later.";

export default async function CampaignMapServer() {
  let movingPlanets: CampaignMapProps["movingPlanets"] = [];
  let parkedPlanets: CampaignMapProps["parkedPlanets"] = [];
  let liberatedPlanets: CampaignMapProps["liberatedPlanets"] = [];
  let supplyLines: CampaignMapProps["supplyLines"] = [];
  let error: string | null = null;

  try {
    const data = await getCampaignData();

    if (data === null) {
      error = ERROR_MESSAGE;
    } else {
      movingPlanets = data.movingPlanets;
      parkedPlanets = data.parkedPlanets;
      liberatedPlanets = data.liberatedPlanets;
      supplyLines = data.supplyLines;
    }
  } catch (err) {
    console.error("Failed to fetch campaign data for map:", err);
    error = ERROR_MESSAGE;
  }

  return (
    <CampaignMap
      movingPlanets={movingPlanets}
      parkedPlanets={parkedPlanets}
      liberatedPlanets={liberatedPlanets}
      supplyLines={supplyLines}
      error={error}
    />
  );
}
