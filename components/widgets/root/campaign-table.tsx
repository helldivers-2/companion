import { getCampaignStats } from "@/lib/get-campaigns";
import type { CampaignStats } from "@/types/campaigns";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";

export default async function CampaignTable() {
  const { activePlanets, totalPlayerCount }: CampaignStats =
    await getCampaignStats();

  return (
    <CampaignTableClient
      activePlanets={activePlanets}
      totalPlayerCount={totalPlayerCount}
    />
  );
}
