import { siteConfig } from "@/config/site";

export async function getAPI({
  url,
  revalidate = 3600,
  timeout = 10000,
  fallback = [],
}: {
  url: string;
  revalidate?: number | false;
  timeout?: number;
  fallback?: unknown;
}) {
  try {
    const fetchOptions = {
      next: { revalidate },
      headers: {
        "X-Super-Client": siteConfig.x_super.client,
        "X-Super-Contact": siteConfig.x_super.contact,
      },
    };
    const apiUrl = `https://api.helldivers2.dev/api${url}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let res: Response;
    try {
      res = await fetch(apiUrl, { ...fetchOptions, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    // Retry once on rate limit with a fresh timeout
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after")) || 2;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
      try {
        res = await fetch(apiUrl, { ...fetchOptions, signal: retryController.signal });
      } finally {
        clearTimeout(retryTimeoutId);
      }
    }

    if (!res.ok) {
      console.error(`API ${url} returned HTTP ${res.status}: ${res.statusText}`);
      return fallback;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error(`API ${url} failed: ${message}`);
    return fallback;
  }
}

export const REVALIDATION_TIMES = {
  NEWSFEED: 300, // 5 minutes

  DISPATCHES: 600, // 10 minutes

  MAJOR_ORDER: 900, // 15 minutes

  STATISTICS: 1800, // 30 minutes

  GET_CAMPAIGNS: 3600, // 1 hour
} as const;
