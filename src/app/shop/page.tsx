import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import Container from "@/components/containerCard";
import { CardDescription } from "@/components/ui/card";
import ItemShop from "@/components/widgets/itemShop";

export const metadata: Metadata = {
  title: "Daily Item Shop",
  description:
    "Check out the latest daily item shop for [Game Name]. Browse through the available items, including images, cost, and type.",
  keywords: "[Game Name], daily item shop, items, cost, type, images",
  openGraph: {
    title: "Daily Item Shop",
    description:
      "Check out the latest daily item shop for [Game Name]. Browse through the available items, including images, cost, and type.",
  },
  twitter: {
    title: "Daily Item Shop",
    description:
      "Check out the latest daily item shop for [Game Name]. Browse through the available items, including images, cost, and type.",
  },
};

export default function ShopPage() {
  const Comments = useMemo(
    () =>
      dynamic(() => import("@/components/giscusComponent"), {
        loading: () => (
          <Skeleton className="h-10 w-full animate-pulse rounded-lg bg-muted px-4 py-2" />
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <>
      <Container title="Shop">
        <CardDescription>Updates in:</CardDescription>
        <ItemShop />
      </Container>
      <Comments keyword="Shop" reactions="1" />
    </>
  );
}
