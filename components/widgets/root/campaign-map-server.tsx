import { getCampaignStats } from "@/lib/get-campaigns";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";

export default async function CampaignMapServer() {
  try {
    const { activePlanets, liberatedPlanets } = await getCampaignStats();
    return (
      <CampaignMap
        activePlanets={activePlanets}
        liberatedPlanets={liberatedPlanets}
      />
    );
  } catch (error) {
    console.error("Failed to fetch campaign data for map:", error);
    return (
      <CampaignMap
        activePlanets={[]}
        liberatedPlanets={[]}
        error={String(error)}
      />
    );
  }
}
