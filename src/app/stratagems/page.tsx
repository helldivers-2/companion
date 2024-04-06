import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import Container from "@/components/containerCard";
import AllStratagemsTable from "@/components/widgets/stratagems/allStratagems";

export const metadata: Metadata = {
  title: "Helldivers 2 Stratagem Database",
  description:
    "Explore a comprehensive database of all stratagems (abilities) in Helldivers 2. Search, sort, and filter stratagems by name, cooldown, category, and more using our responsive table.",
  keywords:
    "Helldivers 2, stratagems, abilities, database, cooldown, categories, search, sort, filter",
  openGraph: {
    title: "Helldivers 2 Stratagem Database",
    description:
      "Explore a comprehensive database of all stratagems (abilities) in Helldivers 2. Search, sort, and filter stratagems by name, cooldown, category, and more using our responsive table.",
  },
  twitter: {
    title: "Helldivers 2 Stratagem Database",
    description:
      "Explore a comprehensive database of all stratagems (abilities) in Helldivers 2. Search, sort, and filter stratagems by name, cooldown, category, and more using our responsive table.",
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
      <Container title="all Stratagems">
        <AllStratagemsTable />
      </Container>
      <Comments keyword="Stratagems" reactions="0" />
    </>
  );
}
