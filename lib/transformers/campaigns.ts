import type {
  CampaignDto,
  Campaign,
  PlanetDto,
  Planet,
  PlanetRegion,
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
    regions: dto.regions,
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
  // Negative regen means the planet's own health is decaying toward Super Earth
  // control, so the front is gaining ground on its own. Folding that into
  // "Stable" read as a stalemate on the one planet actually being won.
  if (regenPercent < 0) return { text: "Liberating", color: "success" };
  if (regenPercent > 0.5)
    return { text: "Counterattacking", color: "destructive" };
  return { text: "Stable", color: "muted" };
}

export const STATUS_TEXT_CLASS: Record<string, string> = {
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

// Below this, a health bar is indistinguishable from untouched. Used to decide
// whether a front has moved at all, so it needs to be forgiving of the integer
// health values the API reports rather than an exact equality check.
const PROGRESS_EPSILON = 0.0001;

function progressFraction(health: number, maxHealth: number): number {
  if (maxHealth <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - health / maxHealth));
}

function hasProgress(health: number, maxHealth: number): boolean {
  return progressFraction(health, maxHealth) >= PROGRESS_EPSILON;
}

// The region players are actually pushing. Locked regions are excluded: they
// sit at full health no matter how many divers are on the planet, so surfacing
// one would name a front nobody can affect. Falls back to any region that has
// taken damage (a region can lock again after being chipped) and returns null
// for planets the API reports without regions at all.
export function getLeadingRegion(planet: Planet): PlanetRegion | null {
  const regions = planet.regions ?? [];
  const unlocked = regions.filter((region) => region.isAvailable !== false);
  const pool =
    unlocked.length > 0
      ? unlocked
      : regions.filter((region) =>
          hasProgress(region.health, region.maxHealth),
        );
  if (pool.length === 0) return null;

  return pool.reduce((best, region) => {
    const delta =
      progressFraction(region.health, region.maxHealth) -
      progressFraction(best.health, best.maxHealth);
    if (Math.abs(delta) > Number.EPSILON) return delta > 0 ? region : best;
    return (region.players ?? 0) > (best.players ?? 0) ? region : best;
  });
}

export type CampaignProgress = {
  /** Percentage string, already clamped and fixed to two decimals. */
  value: string;
  /** What the percentage measures, or null when it is plain planet health. */
  label: string | null;
  scope: "event" | "planet" | "region";
};

// The one number worth putting on a row. Planet health alone is dead weight
// under the region system — it reads 0.00% on planets where a city is a quarter
// taken — so fall through to the leading region and say which region it is.
export function getCampaignProgress(planet: Planet): CampaignProgress {
  if (planet.event) {
    return {
      value: getLiberation(planet.event.health, planet.event.maxHealth, true),
      label: "Defense held",
      scope: "event",
    };
  }

  if (hasProgress(planet.health, planet.maxHealth)) {
    return {
      value: getLiberation(planet.health, planet.maxHealth),
      label: null,
      scope: "planet",
    };
  }

  const region = getLeadingRegion(planet);
  if (region && hasProgress(region.health, region.maxHealth)) {
    return {
      value: getLiberation(region.health, region.maxHealth),
      label: region.name,
      scope: "region",
    };
  }

  return { value: "0.00", label: region?.name ?? null, scope: "planet" };
}

// A front is "moving" when there is something to watch: a timed defense, ground
// taken on the planet, or ground taken in one of its regions. Everything else
// is parked — a full-health planet with nothing chipped, which is the state 29
// of 32 campaigns sit in at any given moment.
export function isMoving(campaign: Campaign): boolean {
  const { planet } = campaign;
  if (planet.event != null) return true;
  if (hasProgress(planet.health, planet.maxHealth)) return true;
  return (planet.regions ?? []).some((region) =>
    hasProgress(region.health, region.maxHealth),
  );
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
  return (terminidKills ?? 0) + (automatonKills ?? 0) + (illuminateKills ?? 0);
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
    ? { text: "Defending", color: "warning" }
    : getStatus(regen);
  return { liberation, regen, status };
}

// A campaign planet only counts as liberated once Super Earth holds it at full
// health. Full health alone does not mean liberated: on an enemy-held planet it
// means the opposite — a liberation campaign still sitting at 0% progress.
// Classifying on health alone filed fresh campaigns (and every player fighting
// on them) under "Liberated / 100%".
export function isLiberated(campaign: Campaign): boolean {
  return (
    campaign.planet.event == null &&
    campaign.planet.currentOwner === "Humans" &&
    isApproximatelyEqual(campaign.planet.health, campaign.planet.maxHealth)
  );
}

function playerCount(campaign: Campaign): number {
  return campaign.planet.statistics?.playerCount || 0;
}

// How far along a front is, taking the best of planet health and its regions so
// that region-only progress is not read as zero.
function bestProgress(campaign: Campaign): number {
  const { planet } = campaign;
  const region = getLeadingRegion(planet);
  return Math.max(
    progressFraction(planet.health, planet.maxHealth),
    region ? progressFraction(region.health, region.maxHealth) : 0,
  );
}

// Order by what deserves attention rather than by how much health is left. The
// old sort was health-descending, which put every untouched 0% front at the top
// and buried both the timed defense and the one planet near liberation at the
// bottom of thirty-odd rows. Defenses lead because they expire, soonest first;
// then whatever has taken the most ground; then raw player draw, which is the
// only thing separating fronts that have not moved at all.
function compareByAttention(a: Campaign, b: Campaign): number {
  const aEnd = a.planet.event?.endTime;
  const bEnd = b.planet.event?.endTime;
  if (aEnd && bEnd) return Date.parse(aEnd) - Date.parse(bEnd);
  if (aEnd) return -1;
  if (bEnd) return 1;

  const progressDelta = bestProgress(b) - bestProgress(a);
  if (Math.abs(progressDelta) > Number.EPSILON) return progressDelta;

  return playerCount(b) - playerCount(a);
}

export function getCampaignStats(campaigns: Campaign[]): CampaignStats {
  const liberatedPlanets = campaigns.filter(isLiberated);

  // Everything the war is still being fought over. A campaign at exactly full
  // health (0% liberated) or a defense nobody has chipped yet (100% defense
  // remaining) is active, not finished — previously both fell through every
  // bucket and vanished from the table and the map.
  const activePlanets = campaigns
    .filter((campaign) => !isLiberated(campaign))
    .sort(compareByAttention);

  const movingPlanets = activePlanets.filter(isMoving);
  const parkedPlanets = activePlanets.filter((c) => !isMoving(c));

  const liberatedPlayerCount = liberatedPlanets.reduce(
    (sum, campaign) => sum + playerCount(campaign),
    0,
  );

  return {
    campaigns,
    activePlanets,
    movingPlanets,
    parkedPlanets,
    liberatedPlanets,
    liberatedPlayerCount,
  };
}
