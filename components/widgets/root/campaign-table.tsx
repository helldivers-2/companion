import { getCampaignData } from "@/lib/data/campaigns";
import type { CampaignStats } from "@/types/campaigns";
import { Swords } from "lucide-react";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";
import { WidgetState } from "@/components/widgets/widget-state";

const ERROR_MESSAGE = "Failed to load campaign data. Please try again later.";

export default async function CampaignTable() {
  let movingPlanets: CampaignStats["movingPlanets"] = [];
  let parkedPlanets: CampaignStats["parkedPlanets"] = [];
  let liberatedCount = 0;
  let liberatedPlayerCount = 0;
  let error: string | null = null;

  try {
    const data = await getCampaignData();

    if (data === null) {
      error = ERROR_MESSAGE;
    } else {
      movingPlanets = data.movingPlanets;
      parkedPlanets = data.parkedPlanets;
      liberatedCount = data.liberatedPlanets.length;
      liberatedPlayerCount = data.liberatedPlayerCount;
    }
  } catch (err) {
    console.error("Failed to load campaign table:", err);
    error = ERROR_MESSAGE;
  }

  if (error !== null) {
    return (
      <WidgetState
        icon={Swords}
        title="Unable to load campaigns"
        description={error}
      />
    );
  }

  return (
    <CampaignTableClient
      movingPlanets={movingPlanets}
      parkedPlanets={parkedPlanets}
      liberatedCount={liberatedCount}
      liberatedPlayerCount={liberatedPlayerCount}
    />
  );
}
