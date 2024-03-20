import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContainerCardProps {
  title: string;
  children: ReactNode;
}

const Container: React.FC<ContainerCardProps> = ({ title, children }) => {
  return (
    <Card className="border border-primary bg-muted">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default Container;
