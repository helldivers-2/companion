import { siteConfig } from "@/config/site";
import { API_ORIGIN } from "@/lib/api/endpoints";

export type Result<T> =
  { success: true; data: T } | { success: false; error: Error };

// The API allows 5 requests per window per client and answers the rest with 429
// and a retry-after in seconds. A cold render of the status page needs more than
// 5 endpoints, so being throttled is the normal case, not an exceptional one.
const MAX_RETRIES = 3;
const DEFAULT_RETRY_AFTER_SECONDS = 2;

// Once any request is throttled, every request holds until that window resets.
// Retrying on independent clocks would spend the fresh slots on retries that all
// land at once and push most of them straight into another 429.
let throttledUntil = 0;

// Next only memoizes fetches that carry no AbortSignal, and every request here
// has a timeout signal, so identical concurrent calls are shared here instead.
const inFlight = new Map<string, Promise<Result<unknown>>>();

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// `url` is an absolute path on the API origin, including any /api or /raw
// prefix (see ENDPOINTS). It is deliberately not joined with /api here: the raw
// ArrowHead passthrough is not nested under /api, and guessing the prefix in two
// places would send raw requests to a 404.
export function getAPI<T>({
  url,
  revalidate = 3600,
  timeout = 10000,
}: {
  url: string;
  revalidate?: number | false;
  timeout?: number;
}): Promise<Result<T>> {
  const key = `${url}#${revalidate}`;
  let pending = inFlight.get(key);
  if (!pending) {
    pending = request(url, revalidate, timeout).finally(() =>
      inFlight.delete(key),
    );
    inFlight.set(key, pending);
  }
  return pending as Promise<Result<T>>;
}

async function request(
  url: string,
  revalidate: number | false,
  timeout: number,
): Promise<Result<unknown>> {
  const apiUrl = `${API_ORIGIN}${url}`;
  const fetchOptions = {
    next: { revalidate },
    headers: {
      "X-Super-Client": siteConfig.x_super.client,
      "X-Super-Contact": siteConfig.x_super.contact,
    },
  };

  try {
    for (let attempt = 0; ; attempt++) {
      const wait = throttledUntil - Date.now();
      if (wait > 0) await sleep(wait);

      const res = await fetch(apiUrl, {
        ...fetchOptions,
        signal: AbortSignal.timeout(timeout),
      });

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter =
          Number(res.headers.get("retry-after")) || DEFAULT_RETRY_AFTER_SECONDS;
        throttledUntil = Math.max(
          throttledUntil,
          Date.now() + retryAfter * 1000,
        );
        continue;
      }

      if (!res.ok) {
        // HTTP/2 responses carry no reason phrase, so statusText is often empty.
        const reason = res.statusText ? `: ${res.statusText}` : "";
        const message = `API ${url} returned HTTP ${res.status}${reason}`;
        console.error(message);
        return { success: false, error: new Error(message) };
      }

      return { success: true, data: await res.json() };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`API ${url} failed: ${message}`);
    return { success: false, error: new Error(message) };
  }
}
