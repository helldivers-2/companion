import type { Metadata } from "next";
import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";

import Container from "@/components/containerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Comments from "@/components/giscusComponent";

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

  const MajorOrder = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/latestOrder"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[268px]" />
        ),
        ssr: true,
      }),
    [],
  );
  const TargetsTableComponent = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/targets/currentTargets"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[450px]" />
        ),
        ssr: true,
      }),
    [],
  );
  const PatchNotes = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/patchNotes"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[450px]" />
        ),
        ssr: true,
      }),
    [],
  );
  const StatsWidget = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/globalStats"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[450px]" />
        ),
        ssr: true,
      }),
    [],
  );

  return (
    <>
      <Container title="Galaxy Status">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>latest Major Order</CardTitle>
            </CardHeader>
            <CardContent>
              <MajorOrder />
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
              <Map />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <PatchNotes />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Galaxy Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsWidget />
            </CardContent>
          </Card>
        </div>
      </Container>
      <Comments keyword="Status" reactions="0" />
    </>
  );
}
