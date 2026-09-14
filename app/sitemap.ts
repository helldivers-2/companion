import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPlanets } from "@/lib/data/planets";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  // Planet pages are the only statically linkable long tail. Campaigns, station
  // and dispatch ids turn over with the war, so listing them would mostly
  // advertise 404s by the time a crawler follows up.
  const planets = await getPlanets();

  if (planets === null) {
    return base;
  }

  return [
    ...base,
    ...planets
      .filter((planet) => planet.index != null)
      .map((planet) => ({
        url: `${siteConfig.url}/planet/${planet.index}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.5,
      })),
  ];
}
