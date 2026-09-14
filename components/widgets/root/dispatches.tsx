import { getDispatches } from "@/lib/data/dispatches";
import {
  parseContent,
  getDispatchTypeInfo,
  stripDispatchHeadline,
} from "@/lib/transformers/dispatches";
import { Badge } from "@/components/ui/badge";
import { WidgetState } from "@/components/widgets/widget-state";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function Dispatches() {
  const dispatches = await getDispatches();

  if (dispatches === null) {
    return (
      <WidgetState
        icon={Clock}
        title="Unable to load dispatches"
        description="Failed to retrieve updates from High Command. Please try again later."
      />
    );
  }

  if (dispatches.length === 0) {
    return (
      <WidgetState
        icon={Clock}
        title="No dispatches yet"
        description="Check back later for updates from High Command."
      />
    );
  }

  return (
    <div className="space-y-3">
      {dispatches.slice(0, 5).map((dispatch) => {
        const publishedDate = new Date(dispatch.published);
        const typeInfo = getDispatchTypeInfo(dispatch.message);
        const Icon = typeInfo.icon;

        return (
          <div
            key={dispatch.id}
            className="border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <Badge
                variant="outline"
                className={`${typeInfo.color} font-medium`}
              >
                <Icon className="mr-1.5 h-3 w-3" />
                {typeInfo.label}
              </Badge>

              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <time dateTime={dispatch.published}>
                  {formatDistanceToNow(publishedDate, {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>

            <div className="text-sm leading-relaxed">
              {stripDispatchHeadline(parseContent(dispatch.message))}
            </div>

            <Link
              href={`/dispatch/${dispatch.id}`}
              className="mt-1 inline-block text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Permalink
            </Link>
          </div>
        );
      })}
    </div>
  );
}
