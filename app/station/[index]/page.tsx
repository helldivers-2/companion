import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { getSpaceStation } from "@/lib/data/space-station";
import SpaceStationDetail from "@/components/widgets/space-station/space-station-detail";

interface StationPageProps {
  params: Promise<{ index: string }>;
}

export async function generateMetadata({
  params,
}: StationPageProps): Promise<Metadata> {
  const { index } = await params;
  const station = await getSpaceStation(index);
  if (station === null) return { title: "Space station not found" };
  return {
    title: `${station.planet.name} Space Station`,
    description: `Tactical actions and election status for the Democracy Space Station at ${station.planet.name}.`,
  };
}

export default async function StationPage({ params }: StationPageProps) {
  const { index } = await params;
  if (!/^\d+$/.test(index)) notFound();

  const station = await getSpaceStation(index);
  if (station === null) notFound();

  return (
    <Container title={`${station.planet.name} Station`}>
      <DashboardCard title="Democracy Space Station">
        <SpaceStationDetail station={station} />
      </DashboardCard>
    </Container>
  );
}
