import type {
  CampaignDto,
  Campaign,
  PlanetDto,
  Planet,
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

export function getLiberationRate(
  regenPerSecond: number,
  maxHealth: number,
): number {
  if (maxHealth === 0) return 0;
  const hourlyRegen = regenPerSecond * 3600;
  const ratePercent = (hourlyRegen / maxHealth) * 100;
  return -ratePercent;
}

export function getStatus(rate: number): { text: string; color: string } {
  if (rate > 0.5) return { text: "Gaining Ground", color: "text-green-500" };
  if (rate < -0.5) return { text: "Losing Ground", color: "text-red-500" };
  return { text: "Stalemate", color: "text-yellow-500" };
}

export function getTimeToLiberation(
  liberation: number,
  ratePerHour: number,
): string | null {
  if (ratePerHour <= 0) return null;
  const hoursRemaining = (100 - liberation) / ratePerHour;
  const minutes = Math.round(hoursRemaining * 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

export function getPlanetStats(planet: Planet) {
  const { health, maxHealth } = getEffectiveHealth(planet);
  const liberation = getLiberation(health, maxHealth);
  const regenPerSecond = planet.regenPerSecond || 0;
  const rate = getLiberationRate(regenPerSecond, maxHealth);
  const status = getStatus(rate);
  const eta = getTimeToLiberation(Number(liberation), rate);
  return { liberation, rate, status, eta };
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

  const activePlanets = [...campaignPlanets, ...eventPlanets].sort((a, b) => {
    const { health: aH, maxHealth: aMH } = getEffectiveHealth(a.planet);
    const { health: bH, maxHealth: bMH } = getEffectiveHealth(b.planet);
    return bH / bMH - aH / aMH;
  });

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
