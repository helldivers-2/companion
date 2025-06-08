import { siteConfig } from "@/config/site";

export async function getAPI({ url }: { url: string }) {
  try {
    const res = await fetch(url, {
      headers: {
        "X-Super-Client": siteConfig.x_super.client,
        "X-Super-Contact": siteConfig.x_super.contact,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`API Error: ${String(error)}`);
  }
}
