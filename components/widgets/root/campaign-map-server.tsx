import { getCampaignData } from "@/lib/data/campaigns";
import { getWarMetadata, getWarStatus } from "@/lib/data/war-metadata";
import { getAttackLines } from "@/lib/transformers/war-metadata";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";
import type { CampaignMapProps } from "@/components/widgets/root/campaign-map";

const ERROR_MESSAGE = "Failed to load campaign data. Please try again later.";

export default async function CampaignMapServer() {
  let movingPlanets: CampaignMapProps["movingPlanets"] = [];
  let parkedPlanets: CampaignMapProps["parkedPlanets"] = [];
  let liberatedPlanets: CampaignMapProps["liberatedPlanets"] = [];
  let attackLines: CampaignMapProps["attackLines"] = [];
  let error: string | null = null;

  try {
    const [data, metadata, status] = await Promise.all([
      getCampaignData(),
      getWarMetadata(),
      getWarStatus(),
    ]);

    if (data === null) {
      error = ERROR_MESSAGE;
    } else {
      movingPlanets = data.movingPlanets;
      parkedPlanets = data.parkedPlanets;
      liberatedPlanets = data.liberatedPlanets;
      attackLines =
        metadata && status
          ? getAttackLines(status.attacks, metadata.planetPositions)
          : [];
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
      attackLines={attackLines}
      error={error}
    />
  );
}
