import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Shop",
  description: "-",
};

export default function ShopPage() {
  return (
    <Card className="border border-primary bg-muted">
      <CardHeader>
        <CardTitle>Shop</CardTitle>
        <CardDescription>Updates in:</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 grid-rows-2 gap-4">
        <Card className="row-span-2 aspect-square">
          <CardHeader>
            <CardTitle>1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card className="row-auto">
          <CardHeader>
            <CardTitle>2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card className="col-start-2 row-auto row-start-2">
          <CardHeader>
            <CardTitle>3</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card className="col-start-3 row-span-2 row-start-1 aspect-square">
          <CardHeader>
            <CardTitle>4</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
