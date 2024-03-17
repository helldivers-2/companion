import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description: "-",
};

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewsPage() {
  return (
    <Card className="border border-primary bg-muted">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>News</CardTitle> <Button>Source</Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
        <Card>
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
