import { Suspense } from "react";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { WidgetSkeleton } from "@/components/widgets/widget-skeleton";
import GalaxyBrowserServer from "@/components/widgets/galaxy/galaxy-browser-server";
import PlanetEvents from "@/components/widgets/root/planet-events";
import SuperEarthNews from "@/components/widgets/news/super-earth-news";

export default function GalaxySection() {
  return (
    <section id="galaxy">
      <Container title="Galaxy">
        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2 lg:row-span-2">
            <DashboardCard title="All Planets" as="h3">
              <Suspense fallback={<WidgetSkeleton rows={8} />}>
                <GalaxyBrowserServer />
              </Suspense>
            </DashboardCard>
          </div>
          <div className="lg:col-span-1">
            <DashboardCard title="Active Defenses" as="h3">
              <Suspense fallback={<WidgetSkeleton />}>
                <PlanetEvents />
              </Suspense>
            </DashboardCard>
          </div>
          <div className="lg:col-span-1">
            <DashboardCard title="Super Earth Broadcast" as="h3">
              <Suspense fallback={<WidgetSkeleton />}>
                <SuperEarthNews />
              </Suspense>
            </DashboardCard>
          </div>
        </div>
      </Container>
    </section>
  );
}
