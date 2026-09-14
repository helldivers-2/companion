import { getSuperEarthNews } from "@/lib/data/war-metadata";
import { parseContent } from "@/lib/transformers/dispatches";
import { Radio } from "lucide-react";

export default async function SuperEarthNews() {
  const news = await getSuperEarthNews();

  if (news === null) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Unable to load the Super Earth broadcast. Please try again later.
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="py-8 text-center">
        <Radio className="mx-auto mb-3 h-10 w-10 text-icon" />
        <h3 className="mb-1 text-base font-medium">No Broadcasts</h3>
        <p className="text-sm text-muted-foreground">
          Super Earth has nothing to announce. Citizen.
        </p>
      </div>
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
