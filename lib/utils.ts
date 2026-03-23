import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import millifyLib from "millify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function millify(value: number): string {
  return millifyLib(value, { locales: "en" });
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
