import type { Metadata } from "next";
import PlanetsTable from "@/components/planetsTable";
import { DataTableDemo } from "./events/data-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Status - Helldivers Info",
  description: "-",
};

export default function Home() {
  return (
    <Card className="border border-primary bg-muted">
      <CardHeader>
        <CardTitle>Galaxy Status</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="aspect-video">
          <CardHeader>
            <CardTitle>Major Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card className="aspect-video">
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Events</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableDemo />
          </CardContent>
        </Card>
        <Card className="aspect-video">
          <CardHeader>
            <CardTitle>Galaxy Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <PlanetsTable />
      </CardContent>
    </Card>
  );
}
