import { getPlanets } from "@/lib/data/planets";
import {
  getGalaxyPlanetStats,
  getOwningFactions,
  getSectors,
} from "@/lib/transformers/planets";
import { Globe } from "lucide-react";
import { GalaxyBrowser } from "@/components/widgets/galaxy/galaxy-browser";
import { WidgetState } from "@/components/widgets/widget-state";

export default async function GalaxyBrowserServer() {
  const planets = await getPlanets();

  if (planets === null) {
    return (
      <WidgetState
        icon={Globe}
        title="Unable to load the galaxy"
        description="Please try again later."
      />
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
