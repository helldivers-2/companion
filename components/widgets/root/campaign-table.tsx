import { getCampaignData } from "@/lib/data/campaigns";
import type { CampaignStats } from "@/types/campaigns";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";

const ERROR_MESSAGE = "Failed to load campaign data. Please try again later.";

export default async function CampaignTable() {
  let activePlanets: CampaignStats["activePlanets"] = [];
  let liberatedPlayerCount = 0;
  let error: string | null = null;

  try {
    const data = await getCampaignData();

    if (data === null) {
      error = ERROR_MESSAGE;
    } else {
      activePlanets = data.activePlanets;
      liberatedPlayerCount = data.liberatedPlayerCount;
    }
  } catch (err) {
    console.error("Failed to load campaign table:", err);
    error = ERROR_MESSAGE;
  }

  if (error !== null) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <CampaignTableClient
      activePlanets={activePlanets}
      liberatedPlayerCount={liberatedPlayerCount}
    />
  );
}
