import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitleH1,
} from "@/components/ui/card";

interface ContainerCardProps {
  title: string;
  children: ReactNode;
}

const Container: React.FC<ContainerCardProps> = ({ title, children }) => {
  return (
    <Card className="border border-primary bg-muted">
      <CardHeader>
        <CardTitleH1>{title}</CardTitleH1>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default Container;
