import type { Metadata } from "next";
import TargetsTableComponent from "./events/data-table-component";
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
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetsTableComponent />
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
            <p>Newest Blog entry (visit overview to see all button)</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
