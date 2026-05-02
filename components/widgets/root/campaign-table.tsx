import { getCampaignStats } from "@/lib/get-campaigns";
import type { CampaignStats } from "@/types/campaigns";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";

export default async function CampaignTable() {
  try {
    const { activePlanets, liberatedPlayerCount }: CampaignStats =
      await getCampaignStats();

    return (
      <CampaignTableClient
        activePlanets={activePlanets}
        liberatedPlayerCount={liberatedPlayerCount}
      />
    );
  } catch (error) {
    console.error("Failed to load campaign table:", error);
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load campaign data. Please try again later.
      </div>
    );
  }
}
