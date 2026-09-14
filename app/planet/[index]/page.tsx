import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlanet } from "@/lib/data/planets";
import PlanetOverview from "@/components/widgets/galaxy/planet-overview";
import PlanetBattleStats from "@/components/widgets/galaxy/planet-battle-stats";

interface PlanetPageProps {
  params: Promise<{ index: string }>;
}

export async function generateMetadata({
  params,
}: PlanetPageProps): Promise<Metadata> {
  const { index } = await params;
  const planet = await getPlanet(index);

  if (planet === null) {
    return { title: "Planet not found" };
  }

  return {
    title: planet.name,
    description: `${planet.name} (${planet.sector} Sector): live liberation, owner and battle statistics in the Galactic War.`,
  };
}

export default async function PlanetPage({ params }: PlanetPageProps) {
  const { index } = await params;

  // A malformed index would otherwise reach the API as a 404 and render an
  // empty shell; reject it at the route boundary instead.
  if (!/^\d+$/.test(index)) {
    notFound();
  }

  const planet = await getPlanet(index);

  if (planet === null) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section>
        <Container title={planet.name}>
          <PlanetOverview planet={planet} />
        </Container>
      </section>

      <section>
        <Container title="Battle Record">
          <DashboardCard title={`${planet.name} Statistics`}>
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <PlanetBattleStats planetIndex={planet.index} />
            </Suspense>
          </DashboardCard>
        </Container>
      </section>
    </div>
  );
}
