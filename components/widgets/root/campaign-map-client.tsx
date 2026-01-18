"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignMap = dynamic(
  () => import("@/components/widgets/root/campaign-map"),
  {
    loading: () => (
      <Skeleton className="aspect-square w-full animate-pulse rounded-none bg-muted md:aspect-video" />
    ),
    ssr: false,
  },
);

export default CampaignMap;
