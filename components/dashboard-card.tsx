import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const DashboardCard = ({ title, children, className }: {title:string, children:ReactNode, className?:string}) => (
  <Card className={cn("h-full", className)}>
    <CardHeader>
      <CardTitle className="uppercase text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);