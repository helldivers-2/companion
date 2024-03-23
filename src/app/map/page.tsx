"use client";

import React from "react";
import Container from "@/components/containerCard";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export default function MapPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <Skeleton className="aspect-video rounded-lg border" />,
        ssr: false,
      }),
    [],
  );

  return (
    <Container title="Galaxy Map">
      <Map />
    </Container>
  );
}
