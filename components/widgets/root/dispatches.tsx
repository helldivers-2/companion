import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    .replace(/<i=1>(.*?)<\/i>/g, "")
    .replace(/<i=3>(.*?)<\/i>/g, "")
    .replace(/<span(.*?)>/g, "")
    .replace(/<\/span>/g, "")

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
      {dispatches.slice(0, 1).map((dispatch) => {
        const publishedDate = new Date(dispatch.published);
        const typeInfo = getDispatchTypeInfo(dispatch.message);
        const Icon = typeInfo.icon;

        return (
          <Card
            key={dispatch.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={`${typeInfo.color} border-0 font-medium`}
                >
                  <Icon className="mr-1.5 h-3 w-3" />
                  {typeInfo.label}
                </Badge>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  <time dateTime={dispatch.published}>
                    {formatDistanceToNow(publishedDate, {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-sm leading-relaxed">
                {parseContent(dispatch.message)}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Empty state */}
      {dispatches.length === 0 && (
        <div className="py-12 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-medium">No dispatches available</h3>
          <p>Check back later for updates from High Command</p>
        </div>
      )}
    </div>
  );
}
