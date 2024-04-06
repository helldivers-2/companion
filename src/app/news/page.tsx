import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import Container from "@/components/containerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Container title="News">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="col-start-1">
            <CardHeader>
              <CardTitle>Dispatches</CardTitle>
            </CardHeader>
            <CardContent>
              <News />
            </CardContent>
          </Card>
          <Card className="col-start-1">
            <CardHeader>
              <CardTitle>Patch Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <PatchNotes />
            </CardContent>
          </Card>
          <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <CardHeader>
              <CardTitle>Info about the Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert">
                <p>
                  Helldivers 2 is the highly anticipated sequel to the
                  cooperative third-person shooter game, Helldivers. Released in
                  February 2024, the game has received positive reviews and has
                  sold over 8 million units within the first two months of its
                  release.
                </p>

                <h2 className="text-2xl">Gameplay Updates and Features</h2>
                <ul className="list-outside list-disc pl-4">
                  <li>
                    Helldivers 2 features a third-person shooter gameplay,
                    unlike the top-down shooter of the first game.
                  </li>
                  <li>
                    The game retains the use of &apos;stratagems&apos; from the
                    previous title, such as cluster bombs, sentry guns, and
                    supply pods.
                  </li>
                  <li>
                    Friendly fire is always on, and the game&apos;s armor system
                    is inspired by real-world firearms against armored targets.
                  </li>
                  <li>
                    Cooperative multiplayer supports up to four players, but
                    there is no dedicated single-player campaign.
                  </li>
                  <li>
                    The game features optional cross-play between PlayStation 5
                    and Windows platforms.
                  </li>
                  <li>
                    Players can earn various in-game currencies, including
                    &apos;war-bond medals&apos;, &apos;requisition slips&apos;,
                    and &apos;super credits&apos;, to unlock new weapons and
                    stratagems.
                  </li>
                  <li>
                    Players contribute to the collective &quot;liberation&quot;
                    of planets, which is displayed on the Galactic Map.
                  </li>
                </ul>

                <h2 className="text-2xl">Recent Updates and Patch Notes</h2>
                <p>
                  Helldivers 2 has received regular updates and improvements
                  since its launch in February 2024. Some of the recent updates
                  include:
                </p>
                <ul className="list-outside list-disc pl-4">
                  <li>
                    April 3rd, 2024: Players who fought on the brutal Malevelon
                    Creek planet were rewarded with a customizable cape.
                  </li>
                  <li>
                    March 15th, 2024: The game reached 8 million units sold and
                    450,000 concurrent players on Steam.
                  </li>
                  <li>
                    March 2nd, 2024: Arrowhead Games CEO Johan Pilestedt
                    addressed the comparisons between Helldivers 2 and the Halo
                    franchise.
                  </li>
                  <li>
                    February 24th, 2024: The game surpassed Call of Duty:
                    Warzone 2.0 and Fortnite as the most actively played game on
                    the PlayStation Network.
                  </li>
                </ul>
                <a
                  className="text-sm text-muted-foreground underline hover:text-primary"
                  href="https://en.wikipedia.org/wiki/Helldivers_2"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
      <Comments keyword="Status" reactions="0" />
    </>
  );
}
