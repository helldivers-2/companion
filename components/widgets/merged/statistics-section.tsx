import { Suspense } from "react";
import Container from "@/components/container";
import { WidgetSkeleton } from "@/components/widgets/widget-skeleton";
import Statistics from "@/components/widgets/statistics/statistics";

export default function StatisticsSection() {
  return (
    <section id="statistics">
      <Container title="Statistics">
        <Suspense fallback={<WidgetSkeleton rows={6} />}>
          <Statistics />
        </Suspense>
      </Container>
    </section>
  );
}
