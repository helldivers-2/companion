"use client";

import React from "react";
import Container from "@/components/containerCard";
import { useMemo } from "react";
import dynamic from "next/dynamic";

export default function MapPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <p>(pulsing animated square)</p>,
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
