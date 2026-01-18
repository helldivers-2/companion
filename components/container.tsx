import { ReactNode } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Comments from "@/components/comments";
import { cn } from "@/lib/utils";

const Container = ({
  title,
  discussion,
  children,
  className,
  lgSplit = false,
}: {
  title?: string;
  discussion?: string;
  children: ReactNode;
  className?: string;
  lgSplit?: boolean;
}) => {
  const lgSplitClass = lgSplit ? "grid gap-4 lg:grid-cols-2" : "";

  return (
    <>
      <Card className={cn("bg-muted", className)}>
        {title ? (
          <CardHeader>
            <CardTitle>
              <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
            </CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={cn(title ? "" : "sm:mt-4", lgSplitClass)}>
          {children}
        </CardContent>
      </Card>

      {discussion ? <Comments keyword={discussion} /> : null}
    </>
  );
};

export default Container;
