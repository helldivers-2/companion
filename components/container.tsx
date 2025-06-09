import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Container = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <Card className="border bg-muted">
      <CardHeader>
        <CardTitle>
          <h1 className="text-center text-4xl font-semibold tracking-tight text-balance mt-4">
            {title}
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default Container;
