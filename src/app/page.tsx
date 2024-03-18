import type { Metadata } from "next";
import DataTablePlanets from "./events/data-table";
import MessagesList from "@/components/currentMessages";

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
        <Card>
          <CardHeader>
            <CardTitle>Current Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTablePlanets />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Galaxy Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Major Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagesList />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
