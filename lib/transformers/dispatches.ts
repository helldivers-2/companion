import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function parseContent(content: string): string {
  return content
    .replace(/<i=\d+>(.*?)<\/i>/g, "$1")
    .replace(/<span[^>]*data-ah="[^"]*"[^>]*>(.*?)<\/span>/g, "$1")
    .trim();
}

// The type badge already reads "New Order", "Victory" or "Failed", so the
// message's own all-caps headline would repeat it directly underneath.
const HEADLINE_PATTERN =
  /^(NEW MAJOR ORDER|MAJOR ORDER (WON|FAILED))[\s:.!-]*/i;

export function stripDispatchHeadline(text: string): string {
  const stripped = text.replace(HEADLINE_PATTERN, "");
  return stripped.length > 0 ? stripped : text;
}

export interface DispatchTypeInfo {
  type: string;
  label: string;
  icon: typeof Clock;
  /** Text color for an outline badge, matching the campaign status badges. */
  color: string;
}

export function getDispatchTypeInfo(message: string): DispatchTypeInfo {
  const upperMessage = message.toUpperCase();
  if (upperMessage.includes("MAJOR ORDER WON")) {
    return {
      type: "success",
      label: "Victory",
      icon: CheckCircle,
      color: "text-success",
    };
  } else if (upperMessage.includes("MAJOR ORDER FAILED")) {
    return {
      type: "failure",
      label: "Failed",
      icon: XCircle,
      color: "text-destructive",
    };
  } else if (upperMessage.includes("NEW MAJOR ORDER")) {
    return {
      type: "urgent",
      label: "New Order",
      icon: AlertTriangle,
      color: "text-warning",
    };
  } else if (
    upperMessage.includes("SABOTAGED") ||
    upperMessage.includes("INVASION")
  ) {
    return {
      type: "alert",
      label: "Alert",
      icon: AlertTriangle,
      color: "text-destructive",
    };
  }
  return {
    type: "info",
    label: "Update",
    icon: Clock,
    color: "text-muted-foreground",
  };
}
