import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import Container from "@/components/containerCard";
import AllItemsTable from "@/components/widgets/items/allItems";

export const metadata: Metadata = {
  title: "Helldivers 2 Equipment Database",
  description:
    "Browse through a comprehensive database of all 167 equipment items and item shop items in Helldivers 2. Search, sort, and filter items with our responsive table.",
  keywords:
    "Helldivers 2, equipment database, weapons, gear, items, item shop, search, sort, filter",
  openGraph: {
    title: "Helldivers 2 Equipment Database",
    description:
      "Browse through a comprehensive database of all 167 equipment items and item shop items in Helldivers 2. Search, sort, and filter items with our responsive table.",
  },
  twitter: {
    title: "Helldivers 2 Equipment Database",
    description:
      "Browse through a comprehensive database of all 167 equipment items and item shop items in Helldivers 2. Search, sort, and filter items with our responsive table.",
  },
};

export default function ItemsPage() {
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
      <Container title="all items">
        <AllItemsTable />
      </Container>
      <Comments keyword="Items" reactions="0" />
    </>
  );
}
