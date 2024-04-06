import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

import Container from "@/components/containerCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          <Card className="row-span-2 aspect-square">
            <CardHeader>
              <CardTitle>1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>-</p>
            </CardContent>
          </Card>
          <Card className="row-auto">
            <CardHeader>
              <CardTitle>2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>-</p>
            </CardContent>
          </Card>
          <Card className="col-start-2 row-auto row-start-2">
            <CardHeader>
              <CardTitle>3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>-</p>
            </CardContent>
          </Card>
          <Card className="col-start-3 row-span-2 row-start-1 aspect-square">
            <CardHeader>
              <CardTitle>4</CardTitle>
            </CardHeader>
            <CardContent>
              <p>-</p>
            </CardContent>
          </Card>
        </div>
      </Container>
      <Comments keyword="Shop" reactions="1" />
    </>
  );
}
