import { siteConfig } from "@/config/site";

export async function getAPI({
  url,
  revalidate = 3600,
  timeout = 10000,
}: {
  url: string;
  revalidate?: number | false;
  timeout?: number;
}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(`https://api.helldivers2.dev/api${url}`, {
      next: { revalidate },
      headers: {
        "X-Super-Client": siteConfig.x_super.client,
        "X-Super-Contact": siteConfig.x_super.contact,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      if (error.message.startsWith("HTTP")) {
        throw error;
      }
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error(`Unexpected error: ${String(error)}`);
  }
}

export const REVALIDATION_TIMES = {
  NEWSFEED: 300, // 5 minutes

  DISPATCHES: 600, // 10 minutes

  MAJOR_ORDER: 900, // 15 minutes

  STATISTICS: 1800, // 30 minutes

  GET_CAMPAIGNS: 3600, // 1 hour
} as const;
