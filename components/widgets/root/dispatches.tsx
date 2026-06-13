import { getDispatches } from "@/lib/data/dispatches";
import {
  parseContent,
  getDispatchTypeInfo,
} from "@/lib/transformers/dispatches";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function Dispatches() {
  const dispatches = await getDispatches();

  if (dispatches === null) {
    return (
      <div className="py-8 text-center">
        <Clock className="mx-auto mb-3 h-10 w-10" />
        <h3 className="mb-1 text-base font-medium">
          Unable to Load Dispatches
        </h3>
        <p className="text-sm text-muted-foreground">
          Failed to retrieve updates from High Command. Please try again later.
        </p>
      </div>
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
                variant="secondary"
                className={`${typeInfo.color} border-0 font-medium`}
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
              {parseContent(dispatch.message)}
            </div>
          </div>
        );
      })}

      {dispatches.length === 0 && (
        <div className="py-8 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10" />
          <h3 className="mb-1 text-base font-medium">
            No dispatches available
          </h3>
          <p className="text-sm text-muted-foreground">
            Check back later for updates from High Command
          </p>
        </div>
      )}
    </div>
  );
}
