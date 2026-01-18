import type { Metadata } from "next"
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";

import PatchNotes from "@/components/widgets/news/newsfeed";
import WikipediaText from "@/components/widgets/news/wiki";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News",
  description: "Current News Feed Published by Arrowhead Studios.",
}

const dashboardCards = [
  {
    title: "Steam Newsfeed",
    component: PatchNotes,
    key: "steam",
  },
  {
    title: "Info about the Game",
    component: WikipediaText,
    key: "wiki",
  },
];

export default function NewsPage() {
  return (
    <Container discussion="News" lgSplit>
      {dashboardCards.map(({ title, component: Component, key }) => (
        <DashboardCard key={key} title={title}>
          <Component />
        </DashboardCard>
      ))}
    </Container>
  );
}
