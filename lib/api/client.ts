import { siteConfig } from "@/config/site";

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export async function getAPI<T>({
  url,
  revalidate = 3600,
  timeout = 10000,
}: {
  url: string;
  revalidate?: number | false;
  timeout?: number;
}): Promise<Result<T>> {
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
      const message = `API ${url} returned HTTP ${res.status}: ${res.statusText}`;
      console.error(message);
      return { success: false, error: new Error(message) };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`API ${url} failed: ${message}`);
    return { success: false, error: new Error(message) };
  }
}
