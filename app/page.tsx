import type { Metadata } from "next"
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";

import MajorOrder from "@/components/widgets/root/major-order";
import CampaignTable from "@/components/widgets/root/campaign-table";
import Dispatches from "@/components/widgets/root/dispatches";
import CampaignMap from "@/components/widgets/root/campaign-map-client";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Relevant Helldivers Data at a Glance. Orders, Campaigns and Map.",
}

const dashboardCards = [
  {
    title: "Major Order",
    component: MajorOrder,
    key: "order",
  },
  {
    title: "Campaigns",
    component: CampaignTable,
    key: "campaigns",
  },
  {
    title: "Dispatches",
    component: Dispatches,
    key: "dispatches",
  },
  {
    title: "Map",
    component: CampaignMap,
    key: "map",
  },
];

export default function StatusPage() {
  return (
    <Container discussion="Status" lgSplit>
      {dashboardCards.map(({ title, component: Component, key }) => (
        <DashboardCard key={key} title={title}>
          <Component />
        </DashboardCard>
      ))}
    </Container>
  );
}
