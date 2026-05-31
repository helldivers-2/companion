import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import PatchNotes from "@/components/widgets/news/newsfeed";
import WikipediaText from "@/components/widgets/news/wiki";

const dashboardCards = [
  {
    title: "Steam Newsfeed",
    component: PatchNotes,
    key: "steam",
  },
  {
    title: "About Helldivers 2",
    component: WikipediaText,
    key: "wiki",
  },
];

export default function NewsSection() {
  return (
    <section id="news">
      <Container title="News" lgSplit>
        {dashboardCards.map(({ title, component: Component, key }) => (
          <DashboardCard key={key} title={title}>
            <Component />
          </DashboardCard>
        ))}
      </Container>
    </section>
  );
}
