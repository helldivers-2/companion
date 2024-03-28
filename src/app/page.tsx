import type { Metadata } from "next";
import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";

import Container from "@/components/containerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import TargetsTableComponent from "@/components/widgets/targets/currentTargets";
import MajorOrder from "@/components/widgets/latestOrder";
import StatsWidget from "@/components/widgets/globalStats";
import PatchNotes from "@/components/widgets/patchNotes";

export const metadata: Metadata = {
  title: "Status - Helldivers Info",
};

export default function Home() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/warMap"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[450px]" />
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <Container title="Galaxy Status">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>latest Major Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted  md:aspect-auto md:h-[144px]" />
              }
            >
              <MajorOrder />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetsTableComponent />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="" />}>
              <Map />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[440px]" />
              }
            >
              <PatchNotes />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Galaxy Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[440px]" />
              }
            >
              <StatsWidget />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
