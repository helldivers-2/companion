import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { getCampaign } from "@/lib/data/campaigns";
import PlanetOverview from "@/components/widgets/galaxy/planet-overview";

interface CampaignPageProps {
  params: Promise<{ index: string }>;
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { index } = await params;
  if (!/^\d+$/.test(index)) return { title: "Campaign not found" };
  const campaign = await getCampaign(index);
  if (campaign === null) return { title: "Campaign not found" };
  return {
    title: `${campaign.planet.name} Campaign`,
    description: `Live campaign status for ${campaign.planet.name}: liberation, regions and the ${campaign.faction} front.`,
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { index } = await params;
  if (!/^\d+$/.test(index)) notFound();

  const campaign = await getCampaign(index);
  if (campaign === null) notFound();

  return (
    <Container title={campaign.planet.name} as="h1">
      <DashboardCard title={`${campaign.faction} Front`}>
        <PlanetOverview planet={campaign.planet} />
      </DashboardCard>
    </Container>
  );
}
