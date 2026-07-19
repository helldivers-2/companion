import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "@/components/widgets/widget-skeleton";

import MajorOrder from "@/components/widgets/root/major-order";
import CampaignTable from "@/components/widgets/root/campaign-table";
import Dispatches from "@/components/widgets/root/dispatches";
import CampaignMap from "@/components/widgets/root/campaign-map-server";
import SpaceStation from "@/components/widgets/root/space-station";
import WarSummary from "@/components/widgets/root/war-summary";

import NewsSection from "@/components/widgets/merged/news-section";
import StatisticsSection from "@/components/widgets/merged/statistics-section";
import FAQSection from "@/components/widgets/merged/faq-section";

export const metadata: Metadata = {
  title: "War Status",
  description:
    "Relevant Helldivers Data at a Glance. Orders, Campaigns and Map.",
};

export default function StatusPage() {
  return (
    <div className="space-y-8">
      <section id="status">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <Card>
                    <CardContent>
                      <Skeleton className="h-5 w-full" />
                    </CardContent>
                  </Card>
                }
              >
                <WarSummary />
              </Suspense>
            </div>

            <div className="lg:col-span-2">
              <DashboardCard title="Major Order">
                <Suspense fallback={<WidgetSkeleton />}>
                  <MajorOrder />
                </Suspense>
              </DashboardCard>
            </div>

            <div className="lg:col-span-1">
              <DashboardCard title="Space Station">
                <Suspense fallback={<WidgetSkeleton />}>
                  <SpaceStation />
                </Suspense>
              </DashboardCard>
            </div>

            <div className="lg:col-span-3">
              <DashboardCard title="Campaigns">
                <Suspense fallback={<WidgetSkeleton rows={6} />}>
                  <CampaignTable />
                </Suspense>
              </DashboardCard>
            </div>

            <div className="self-start lg:col-span-2">
              <DashboardCard title="Map">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <CampaignMap />
                </Suspense>
              </DashboardCard>
            </div>

            <div className="self-start lg:col-span-1">
              <DashboardCard title="Dispatches">
                <ScrollArea className="lg:h-[500px]">
                  <Suspense fallback={<WidgetSkeleton />}>
                    <Dispatches />
                  </Suspense>
                </ScrollArea>
              </DashboardCard>
            </div>
          </div>
        </Container>
      </section>

      <NewsSection />
      <StatisticsSection />
      <FAQSection />
    </div>
  );
}
