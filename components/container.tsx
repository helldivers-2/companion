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
    <Card className="bg-muted">
      <CardHeader>
        <CardTitle>
          <h1 className="mt-4 text-center text-4xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default Container;
