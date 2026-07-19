import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function WidgetSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full last:w-2/3" />
      ))}
    </div>
  );
}
