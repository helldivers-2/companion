import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const DashboardCard = ({
  title,
  children,
  className,
  as: Heading = "h2",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  /** h2 directly under the page title, h3 inside a titled section. */
  as?: "h2" | "h3";
}) => (
  <Card className={cn("h-full", className)}>
    <CardHeader>
      <CardTitle className="text-lg uppercase">
        <Heading>{title}</Heading>
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
