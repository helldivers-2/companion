import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/containerCard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helldivers 2 Player Base Stats: Unbelievable Community Achievements",
  description:
    "Explore the impressive player base statistics for Helldivers 2. See the number of active patriots, lawful victories, hours invested, bugs killed, robots annihilated, ammunition shot, fallen soldiers, collateral friend kills, and more. Get a comprehensive overview of the Helldivers community's impressive in-game achievements.",
  keywords: [
    "Helldivers 2",
    "player base stats",
    "statistics",
    "active patriots",
    "lawful victories",
    "time invested",
    "bugs killed",
    "robots annihilated",
    "ammunition shot",
    "fallen soldiers",
    "collateral friend kills",
    "missions lost",
    "community achievements",
  ],
  openGraph: {
    title: "Helldivers 2 - Player Base Stats",
    description:
      "Explore the impressive player base statistics for Helldivers 2. See the number of active patriots, lawful victories, hours invested, bugs killed, robots annihilated, ammunition shot, fallen soldiers, collateral friend kills, and more. Get a comprehensive overview of the Helldivers community's impressive in-game achievements.",

    type: "website",
  },
  twitter: {
    title: "Helldivers 2 - Player Base Stats",
    description:
      "Explore the impressive player base statistics for Helldivers 2. See the number of active patriots, lawful victories, hours invested, bugs killed, robots annihilated, ammunition shot, fallen soldiers, collateral friend kills, and more. Get a comprehensive overview of the Helldivers community's impressive in-game achievements.",
  },
};

export default function FAQPage() {
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
    <Container title="Galaxy Stats">
      <StatsWidget />
    </Container>
  );
}
