import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export const DashboardCard = ({ title, children }: {title:string, children:ReactNode}) => (
  <Card className="text-lg">
    <CardHeader>
      <CardTitle className="uppercase">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);