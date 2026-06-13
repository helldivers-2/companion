import type { DispatchDto, Dispatch } from "@/types/dispatches";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function mapDispatchDto(dto: DispatchDto): Dispatch {
  return { ...dto };
}

export function parseContent(content: string): string {
  return content
    .replace(/<i=\d+>(.*?)<\/i>/g, "$1")
    .replace(/<span[^>]*data-ah="[^"]*"[^>]*>(.*?)<\/span>/g, "$1")
    .trim();
}

export interface DispatchTypeInfo {
  type: string;
  label: string;
  icon: typeof Clock;
  color: string;
}

export function getDispatchTypeInfo(message: string): DispatchTypeInfo {
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
