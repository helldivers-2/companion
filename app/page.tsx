import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";

import MajorOrder from "@/components/widgets/root/major-order";
import CampaignTable from "@/components/widgets/root/campaign-table";
import Dispatches from "@/components/widgets/root/dispatches";
import CampaignMap from "@/components/widgets/root/campaign-map-client";
import Comments from "@/components/comments";

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

export default function Home() {
  return (
    <>
      <Container>
        <div className="grid gap-4 lg:grid-cols-2">
          {dashboardCards.map(({ title, component: Component, key }) => (
            <DashboardCard key={key} title={title}>
              <Component />
            </DashboardCard>
          ))}
        </div>
      </Container>

      <Comments keyword="Status" reactions="0" />
    </>
  );
}
