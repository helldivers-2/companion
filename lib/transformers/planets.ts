import type { Planet, PlanetDto } from "@/types/campaigns";
import type { GalaxyPlanetStats } from "@/types/planets";
import { isLiberated, mapPlanetDto, species } from "@/lib/transformers/campaigns";

const HUMAN_FACTION = "Humans";

export function mapGalaxyPlanetDto(dto: PlanetDto): Planet {
  return mapPlanetDto(dto);
}

// A planet is contested when the two owners disagree: either we are pushing an
// enemy world (initial owner Human, current owner not) or the enemy has retaken
// a world we used to hold. Neutral worlds nobody claims stay out of the bucket.
function isContested(planet: Planet): boolean {
  if (planet.currentOwner === HUMAN_FACTION) return false;
  return planet.initialOwner === HUMAN_FACTION;
}

export function getGalaxyPlanetStats(planets: Planet[]): GalaxyPlanetStats {
  let activeEvents = 0;
  let humanOwned = 0;
  let enemyOwned = 0;
  let contested = 0;
  let totalPlayers = 0;

  for (const planet of planets) {
    if (planet.event) activeEvents += 1;
    if (planet.currentOwner === HUMAN_FACTION) humanOwned += 1;
    else enemyOwned += 1;
    if (isContested(planet)) contested += 1;
    totalPlayers += planet.statistics?.playerCount ?? 0;
  }

  return {
    totalPlanets: planets.length,
    activeEvents,
    humanOwned,
    enemyOwned,
    contested,
    totalPlayers,
  };
}

export function isHumanOwned(planet: Planet): boolean {
  return planet.currentOwner === HUMAN_FACTION;
}

export { isLiberated };

// The set of factions that actually appear as owners, in the canonical order
// declared by `species`, so filter chips render consistently regardless of the
// order planets arrive in.
export function getOwningFactions(planets: Planet[]): string[] {
  const present = new Set(planets.map((planet) => planet.currentOwner));
  const known = species
    .map((entry) => entry.value)
    .filter((value) => present.has(value));
  const unknown = [...present].filter(
    (value) => !species.some((entry) => entry.value === value),
  );
  return [...known, ...unknown];
}

export function getSectors(planets: Planet[]): string[] {
  return [...new Set(planets.map((planet) => planet.sector))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function filterPlanets(
  planets: Planet[],
  {
    faction = null,
    sector = null,
    query = "",
    eventsOnly = false,
  }: {
    faction?: string | null;
    sector?: string | null;
    query?: string;
    eventsOnly?: boolean;
  } = {},
): Planet[] {
  const needle = query.trim().toLowerCase();
  return planets
    .filter((planet) => faction === null || planet.currentOwner === faction)
    .filter((planet) => sector === null || planet.sector === sector)
    .filter((planet) => !eventsOnly || planet.event != null)
    .filter(
      (planet) =>
        needle === "" ||
        planet.name.toLowerCase().includes(needle) ||
        planet.sector.toLowerCase().includes(needle),
    )
    .sort(
      (a, b) =>
        (b.statistics?.playerCount ?? 0) - (a.statistics?.playerCount ?? 0),
    );
}
