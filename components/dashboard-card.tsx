import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export const DashboardCard = ({ title, children }: {title:string, children:ReactNode}) => (
  <Card>
    <CardHeader>
      <CardTitle className="uppercase text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);