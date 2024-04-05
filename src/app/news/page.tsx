import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helldivers 2 Latest Patch Notes and Updates: Don't Miss a Beat",
  description:
    "Stay up-to-date with the newest Helldivers 2 patch notes and dispatches. Discover the latest updates, fixes, and changes made to the game by the development team. This comprehensive hub ensures you never miss a beat, keeping you informed about the constant evolution of the Helldivers 2 experience. Whether you're a seasoned Helldiver or a newcomer, this page is your go-to source for the latest Helldivers 2 patch information.",
  keywords: [
    "Helldivers 2 latest patch notes",
    "Helldivers 2 updates",
    "Helldivers 2 fixes",
    "Helldivers 2 changes",
    "Helldivers 2 dispatches",
    "Helldivers 2 patch information",
    "Helldivers 2 game updates",
    "Helldivers 2 veteran players",
    "Helldivers 2 new players",
  ],
  openGraph: {
    title: "Helldivers 2 - Patch Notes and Dispatches",
    description:
      "Stay up-to-date with all the latest patch notes and dispatches for Helldivers 2. Browse through the newest updates, fixes, and changes made to the game by the development team. You can easily keep track of what's new and how the game is evolving over time. Whether you're a seasoned Helldiver or just starting out, make sure to check back regularly to discover the latest improvements, balance adjustments, and new content added to the game.",
    type: "article",
  },
  twitter: {
    title: "Helldivers 2 - Patch Notes and Dispatches",
    description:
      "Stay up-to-date with all the latest patch notes and dispatches for Helldivers 2. Browse through the newest updates, fixes, and changes made to the game by the development team. You can easily keep track of what's new and how the game is evolving over time. Whether you're a seasoned Helldiver or just starting out, make sure to check back regularly to discover the latest improvements, balance adjustments, and new content added to the game.",
  },
};

export default function FAQPage() {
  const PatchNotes = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/patchNotes"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-background md:aspect-auto" />
        ),
        ssr: true,
      }),
    [],
  );
  const News = useMemo(
    () =>
      dynamic(() => import("@/components/widgets/newsFeed"), {
        loading: () => (
          <Skeleton className="aspect-square w-full animate-pulse rounded-lg bg-background md:aspect-auto" />
        ),
        ssr: true,
      }),
    [],
  );

  return (
    <>
      <Card className="mx-auto mb-10 w-full max-w-2xl border border-primary bg-muted sm:min-w-[620px]">
        <CardHeader>
          <CardTitle>Dispatches</CardTitle>
        </CardHeader>
        <CardContent>
          <News />
        </CardContent>
      </Card>
      <Card className="mx-auto mb-10 w-full max-w-2xl border border-primary bg-muted sm:min-w-[620px]">
        <CardHeader>
          <CardTitle>Patch Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <PatchNotes />
        </CardContent>
      </Card>
    </>
  );
}
