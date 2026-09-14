import { getSuperEarthNews } from "@/lib/data/war-metadata";
import { parseContent } from "@/lib/transformers/dispatches";
import { Radio } from "lucide-react";
import { WidgetState } from "@/components/widgets/widget-state";

export default async function SuperEarthNews() {
  const news = await getSuperEarthNews();

  if (news === null) {
    return (
      <WidgetState
        icon={Radio}
        title="Unable to load the Super Earth broadcast"
        description="Please try again later."
      />
    );
  }

  if (news.length === 0) {
    return (
      <WidgetState
        icon={Radio}
        title="No broadcasts"
        description="Super Earth has nothing to announce. Citizen."
      />
    );
  }

  return (
    <div className="space-y-3">
      {news.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="border-b border-border pb-3 last:border-0 last:pb-0"
        >
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Radio className="h-3 w-3" />
            <time dateTime={item.published}>
              {new Date(item.published).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </div>
          <p className="text-sm leading-relaxed">
            {parseContent(item.message)}
          </p>
        </div>
      ))}
    </div>
  );
}
