import type {
  CampaignDto,
  Campaign,
  PlanetDto,
  Planet,
  PlanetStatistics,
  Species,
  CampaignStats,
} from "@/types/campaigns";

export const species: Species[] = [
  { value: "Humans", icon: "/factions/Super_Earth.webp" },
  { value: "Terminids", icon: "/factions/Terminids.webp" },
  { value: "Automaton", icon: "/factions/Automatons.webp" },
  { value: "Illuminate", icon: "/factions/Illuminate.webp" },
];

export function getFactionIcon(faction: string): string | null {
  const factionData = species.find((s) => s.value === faction);
  return factionData ? factionData.icon : null;
}

export function mapPlanetDto(dto: PlanetDto): Planet {
  return {
    name: dto.name,
    sector: dto.sector,
    position: dto.position,
    health: dto.health,
    maxHealth: dto.maxHealth,
    regenPerSecond: dto.regenPerSecond,
    currentOwner: dto.currentOwner,
    initialOwner: dto.initialOwner,
    statistics: dto.statistics,
    event: dto.event ?? null,
    biome: dto.biome,
    hazards: dto.hazards,
  };
}

export function mapCampaignDto(dto: CampaignDto): Campaign {
  return {
    id: dto.id,
    planet: mapPlanetDto(dto.planet),
    faction: dto.faction,
  };
}

function isApproximatelyEqual(a: number, b: number, epsilon = 0.01): boolean {
  return Math.abs(a - b) < epsilon;
}

export function getEffectiveHealth(planet: Planet): {
  health: number;
  maxHealth: number;
} {
  return {
    health: planet.event?.health ?? planet.health,
    maxHealth: planet.event?.maxHealth ?? planet.maxHealth,
  };
}

export function getLiberation(
  health: number,
  maxHealth: number,
  inverse: boolean = false,
): string {
  if (maxHealth === 0) return "0.00";
  const healthPercent = (health / maxHealth) * 100;
  const result = inverse ? healthPercent : 100 - healthPercent;
  return Math.max(0, Math.min(100, result)).toFixed(2);
}

// Enemy health regeneration expressed as %/hr of the planet's own max health.
// Positive means the enemy is clawing territory back; higher is harder to hold.
// This is *not* a net liberation rate — a single API snapshot carries no player
// push term, so there is no honest way to say a planet is "gaining ground" or to
// project a time-to-liberation from it.
export function getRegenRate(
  regenPerSecond: number,
  maxHealth: number,
): number {
  if (maxHealth === 0) return 0;
  const hourlyRegen = regenPerSecond * 3600;
  return (hourlyRegen / maxHealth) * 100;
}

export function getStatus(regenPercent: number): {
  text: string;
  color: string;
} {
  if (regenPercent > 0.5)
    return { text: "Regenerating", color: "text-red-500" };
  return { text: "Stable", color: "text-muted-foreground" };
}

// Total enemy kills recorded on a planet, summed across factions. Returns null
// when the payload carries no per-faction kill data at all (so callers can hide
// the field rather than render a misleading zero).
export function getEnemyKills(statistics: PlanetStatistics): number | null {
  const { terminidKills, automatonKills, illuminateKills } = statistics;
  if (
    terminidKills == null &&
    automatonKills == null &&
    illuminateKills == null
  ) {
    return null;
  }
  return (
    (terminidKills ?? 0) + (automatonKills ?? 0) + (illuminateKills ?? 0)
  );
}

export function getPlanetStats(planet: Planet) {
  const isEvent = planet.event != null;
  const { health, maxHealth } = getEffectiveHealth(planet);
  // Events are timed defenses: liberation reads as defense health remaining
  // (inverse), matching how the campaign map renders the same planet.
  const liberation = getLiberation(health, maxHealth, isEvent);
  // Regen only applies to liberation campaigns and to the planet's own health.
  const regen = isEvent
    ? 0
    : getRegenRate(planet.regenPerSecond || 0, planet.maxHealth);
  const status = isEvent
    ? { text: "Defending", color: "text-orange-500" }
    : getStatus(regen);
  return { liberation, regen, status };
}

export function getCampaignStats(campaigns: Campaign[]): CampaignStats {
  const campaignPlanets = campaigns.filter(
    (campaign) =>
      !isApproximatelyEqual(
        campaign.planet.health,
        campaign.planet.maxHealth,
      ) &&
      campaign.planet.health < campaign.planet.maxHealth &&
      campaign.planet.event == null,
  );

  const eventPlanets = campaigns.filter(
    (campaign) =>
      campaign.planet.event != null &&
      !isApproximatelyEqual(
        campaign.planet.event.health,
        campaign.planet.event.maxHealth,
      ) &&
      campaign.planet.event.health < campaign.planet.event.maxHealth,
  );

  const healthFraction = (campaign: Campaign) => {
    const { health, maxHealth } = getEffectiveHealth(campaign.planet);
    return maxHealth === 0 ? 0 : health / maxHealth;
  };
  const activePlanets = [...campaignPlanets, ...eventPlanets].sort(
    (a, b) => healthFraction(b) - healthFraction(a),
  );

  const liberatedPlanets = campaigns.filter(
    (campaign) =>
      isApproximatelyEqual(campaign.planet.health, campaign.planet.maxHealth) &&
      campaign.planet.event === null,
  );

  const liberatedPlayerCount = liberatedPlanets.reduce((sum, campaign) => {
    const playerCount = campaign.planet.statistics?.playerCount || 0;
    return sum + playerCount;
  }, 0);

  return { campaigns, activePlanets, liberatedPlanets, liberatedPlayerCount };
}
