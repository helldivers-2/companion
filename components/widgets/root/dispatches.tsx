import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Dispatch {
  id: number;
  published: string;
  type: number;
  message: string;
}

function parseContent(content: string): string {
  return content
    .replace(/<i=\d+>(.*?)<\/i>/g, "$1") // v1 format: keep content
    .replace(/<span[^>]*data-ah="[^"]*"[^>]*>(.*?)<\/span>/g, "$1") // v2 format: keep content
    .trim();
}

function getDispatchTypeInfo(message: string) {
  const upperMessage = message.toUpperCase();

  if (upperMessage.includes("MAJOR ORDER WON")) {
    return {
      type: "success",
      label: "Victory",
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    };
  } else if (upperMessage.includes("MAJOR ORDER FAILED")) {
    return {
      type: "failure",
      label: "Failed",
      icon: XCircle,
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
  } else if (upperMessage.includes("NEW MAJOR ORDER")) {
    return {
      type: "urgent",
      label: "New Order",
      icon: AlertTriangle,
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    };
  } else if (
    upperMessage.includes("SABOTAGED") ||
    upperMessage.includes("INVASION")
  ) {
    return {
      type: "alert",
      label: "Alert",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
  }

  return {
    type: "info",
    label: "Update",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };
}

export default async function Dispatches() {
  const dispatches: Dispatch[] = await getAPI({
    url: "/v2/dispatches",
    revalidate: REVALIDATION_TIMES.DISPATCHES,
  });

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
            <div className="flex items-center justify-between mb-1.5">
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
          <h3 className="mb-1 text-base font-medium">No dispatches available</h3>
          <p className="text-sm text-muted-foreground">Check back later for updates from High Command</p>
        </div>
      )}
    </div>
  );
}
