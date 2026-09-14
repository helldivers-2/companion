import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// One look for every widget's empty and error states. The title is plain text,
// not a heading, so a failed widget does not add a stray entry to the outline.
export function WidgetState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("py-8 text-center", className)}>
      {Icon && <Icon aria-hidden className="mx-auto mb-3 size-10 text-icon" />}
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
