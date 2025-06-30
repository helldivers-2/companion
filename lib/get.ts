import { siteConfig } from "@/config/site";

export async function getAPI({ url }: { url: string }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`https://api.helldivers2.dev/api${url}`, {
      next: { revalidate: 3600 },
      headers: {
        "X-Super-Client": siteConfig.x_super.client,
        "X-Super-Contact": siteConfig.x_super.contact,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error(`API Error: ${String(error)}`);
  }
}
