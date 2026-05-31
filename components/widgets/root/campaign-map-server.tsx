import { getCampaignData } from "@/lib/data/campaigns";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";

export default async function CampaignMapServer() {
  try {
    const data = await getCampaignData();

    if (data === null) {
      return (
        <CampaignMap
          activePlanets={[]}
          liberatedPlanets={[]}
          error="Failed to load campaign data. Please try again later."
        />
      );
    }

    const { activePlanets, liberatedPlanets } = data;
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
