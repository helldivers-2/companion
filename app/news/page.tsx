import Container from "@/components/container";

import PatchNotes from "@/components/widgets/news/newsfeed";
import WikipediaText from "@/components/widgets/news/wiki";
import Comments from "@/components/comments";
import { DashboardCard } from "@/components/dashboard-card";

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

export default function Page() {
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
