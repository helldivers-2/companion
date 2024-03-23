import type { Metadata } from "next";
import TargetsTableComponent from "./events/data-table-component";
import MessagesList from "@/components/currentMessages";
import { useMemo } from "react";
import dynamic from "next/dynamic";

import Container from "@/components/containerCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Status - Helldivers Info",
  description: "-",
};

export default function Home() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <Skeleton className="aspect-video rounded-lg border" />,
        ssr: false,
      }),
    [],
  );

  return (
    <Container title="Galaxy Status">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        {/*<Card>
          <CardHeader>
            <CardTitle>Major Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagesList />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Newest Blog entry (visit overview to see all button)</p>
          </CardContent>
        </Card>*/}
      </div>
    </Container>
  );
}
