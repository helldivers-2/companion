import type { Metadata } from "next"
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";

import MajorOrder from "@/components/widgets/root/major-order";
import CampaignTable from "@/components/widgets/root/campaign-table";
import Dispatches from "@/components/widgets/root/dispatches";
import CampaignMap from "@/components/widgets/root/campaign-map-client";
import SpaceStation from "@/components/widgets/root/space-station";
import WarSummary from "@/components/widgets/root/war-summary";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Relevant Helldivers Data at a Glance. Orders, Campaigns and Map.",
}

export default function StatusPage() {
  return (
    <Container discussion="Status">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <WarSummary />
        </div>

        <div className="lg:col-span-2">
          <DashboardCard title="Major Order">
            <MajorOrder />
          </DashboardCard>
        </div>

        <div className="lg:col-span-1">
          <DashboardCard title="Space Station">
            <SpaceStation />
          </DashboardCard>
        </div>

        <div className="lg:col-span-3">
          <DashboardCard title="Campaigns">
            <CampaignTable />
          </DashboardCard>
        </div>

        <div className="lg:col-span-2 self-start">
          <DashboardCard title="Map">
            <CampaignMap />
          </DashboardCard>
        </div>

        <div className="lg:col-span-1 self-start">
          <DashboardCard title="Dispatches">
            <ScrollArea className="lg:h-[500px]">
              <Dispatches />
            </ScrollArea>
          </DashboardCard>
        </div>
      </div>
    </Container>
  );
}
