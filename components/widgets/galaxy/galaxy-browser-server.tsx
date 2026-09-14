import { getPlanets } from "@/lib/data/planets";
import {
  getGalaxyPlanetStats,
  getOwningFactions,
  getSectors,
} from "@/lib/transformers/planets";
import { GalaxyBrowser } from "@/components/widgets/galaxy/galaxy-browser";

export default async function GalaxyBrowserServer() {
  const planets = await getPlanets();

  if (planets === null) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Unable to load the galaxy. Please try again later.
      </div>
    );
  }

  return (
    <GalaxyBrowser
      planets={planets}
      factions={getOwningFactions(planets)}
      sectors={getSectors(planets)}
      stats={getGalaxyPlanetStats(planets)}
    />
  );
}
