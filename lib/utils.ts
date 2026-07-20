import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import millifyLib from "millify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function millify(value: number): string {
  return millifyLib(value, { locales: "en" });
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// Coarse countdown to an ISO deadline (e.g. "2d 3h", "2h 30m"). `now` is
// injectable for deterministic tests; server-rendered callers are accurate to
// within the page's revalidation window.
export function formatTimeRemaining(
  endTime: string,
  now: Date = new Date(),
): string {
  const diff = new Date(endTime).getTime() - now.getTime();
  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return `${hours}h ${minutes}m`;
}
