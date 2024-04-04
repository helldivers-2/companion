import type { Metadata } from "next";
import { Suspense, useMemo, lazy } from "react";
import dynamic from "next/dynamic";

import Container from "@/components/containerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the Comments component
const Comments = lazy(() => import("@/components/giscusComponent"));

export const metadata: Metadata = {
  title: "Helldivers 2 Galaxy Status Hub",
  description:
    "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
  keywords:
    "Helldivers 2, Galactic War, attack targets, major orders, maps, patch notes, dispatches, galaxy stats, information hub",
  openGraph: {
    title: "Helldivers 2 Galaxy Status Hub",
    description:
      "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
  },
  twitter: {
    title: "Helldivers 2 Galaxy Status Hub",
    description:
      "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
  },
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
  const News = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/newsFeed"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-auto md:h-[450px]" />
        ),
        ssr: false,
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
              <CardTitle>Dispatches</CardTitle>
            </CardHeader>
            <CardContent>
              <News />
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
      {/* Lazy load the Comments component */}
      <Suspense fallback={<div>Loading...</div>}>
        <Comments keyword="Status" reactions="0" />
      </Suspense>
    </>
  );
}
