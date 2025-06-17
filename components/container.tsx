import { ReactNode } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Comments from "@/components/comments";

const Container = ({
  title,
  discussion,
  children,
  lgSplit = false,
}: {
  title?: string;
  discussion?: string;
  children: ReactNode;
  lgSplit?: boolean;
}) => {
  const lgSplitClass = lgSplit ? "grid gap-4 lg:grid-cols-2" : "";

  return (
    <>
    <Card className="bg-muted">
      {title ? (
        <CardHeader>
          <CardTitle>
            <h1 className="mt-4 text-center text-4xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
          </CardTitle>
        </CardHeader>
      ): null}
      <CardContent className={lgSplitClass}>{children}</CardContent>
    </Card>
    
    {discussion ? (
      <Comments keyword={discussion} />
    ): null }
    </>
  );
};

export default Container;
