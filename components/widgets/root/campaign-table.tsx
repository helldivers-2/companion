import { getCampaignData } from "@/lib/data/campaigns";
import type { CampaignStats } from "@/types/campaigns";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";

export default async function CampaignTable() {
  try {
    const data = await getCampaignData();

    if (data === null) {
      return (
        <div className="p-4 text-center text-red-500">
          Failed to load campaign data. Please try again later.
        </div>
      );
    }

    const { activePlanets, liberatedPlayerCount } = data;

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
