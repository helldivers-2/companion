import type {
  WarInfoDtoInput,
  WarStatusDtoInput,
  WarSummaryDtoInput,
  GalaxyStats,
  PlanetStats,
  NewsFeedItemDtoInput,
  PlanetInfo,
  HomeWorld,
} from "@/types/war-metadata";
import { getFactionFromRace } from "@/types/war-metadata";
import { getFactionIcon } from "@/lib/transformers/campaigns";

export interface SupplyLine {
  source: number;
  target: number;
}

export interface HomeWorldInfo {
  index: number;
  race: number;
  faction: string;
  factionIcon: string | null;
}

export interface WarMetadata {
  warId: number;
  startDate: string | null;
  endDate: string | null;
  minimumClientVersion: string;
  /** Adjacency exactly as ArrowHead reports it (planet index -> neighbour indices). */
  waypoints: Record<number, number[]>;
  /** Undirected supply links derived from the raw waypoint lists. */
  supplyLines: SupplyLine[];
  homeWorlds: HomeWorldInfo[];
  /** Region max health keyed by `${planetIndex}:${regionIndex}`. */
  regionInfo: Record<string, PlanetRegionInfoView>;
  /** Galaxy-map coordinates keyed by planet index. */
  planetPositions: Record<number, { x: number; y: number }>;
  /** Planet indices that are a faction's homeworld. */
  homeWorldIndices: number[];
}

export interface PlanetRegionInfoView {
  planetIndex: number;
  regionIndex: number;
  maxHealth: number;
  size: string | null;
  damageMultiplier: number;
}

export function mapWarInfoDto(dto: WarInfoDtoInput): WarMetadata {
  const waypoints: Record<number, number[]> = {};
  const planetPositions: Record<number, { x: number; y: number }> = {};
  for (const info of dto.planetInfos) {
    waypoints[info.index] = info.waypoints ?? [];
    if (info.position) {
      planetPositions[info.index] = info.position;
    }
  }

  const homeWorlds = getHomeWorlds(dto.homeWorlds ?? []);

  return {
    warId: dto.warId,
    startDate: toIso(dto.startDate),
    endDate: toIso(dto.endDate),
    minimumClientVersion: dto.minimumClientVersion ?? "unknown",
    waypoints,
    planetPositions,
    supplyLines: getSupplyLines(dto.planetInfos),
    homeWorlds,
    homeWorldIndices: homeWorlds.map((world) => world.index),
    regionInfo: getRegionInfo(dto),
  };
}

// Only one direction of a waypoint pair is usually reported, so an A -> B link
// is emitted once and the reverse is skipped. Self-links and duplicates are
// dropped so the map does not draw the same supply line twice.
export function getSupplyLines(planetInfos: PlanetInfo[]): SupplyLine[] {
  const seen = new Set<string>();
  const lines: SupplyLine[] = [];

  for (const info of planetInfos) {
    for (const target of info.waypoints ?? []) {
      if (target === info.index) continue;
      const key = `${Math.min(info.index, target)}:${Math.max(info.index, target)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push({ source: info.index, target });
    }
  }

  return lines;
}

export function getHomeWorlds(homeWorlds: HomeWorld[]): HomeWorldInfo[] {
  return homeWorlds.flatMap((home) =>
    home.planetIndices.map((index) => {
      const faction = getFactionFromRace(home.race);
      return {
        index,
        race: home.race,
        faction,
        factionIcon: getFactionIcon(faction),
      };
    }),
  );
}

function getRegionInfo(dto: WarInfoDtoInput): Record<string, PlanetRegionInfoView> {
  const regionInfo: Record<string, PlanetRegionInfoView> = {};
  for (const region of dto.planetRegions ?? []) {
    const view: PlanetRegionInfoView = {
      planetIndex: region.planetIndex,
      regionIndex: region.regionIndex,
      maxHealth: region.maxHealth,
      size: null,
      damageMultiplier: region.damageMultiplier ?? 1,
    };
    regionInfo[`${region.planetIndex}:${region.regionIndex}`] = view;
  }
  return regionInfo;
}

export interface WarStatusView {
  warId: number;
  planetOwners: Record<number, string>;
  planetHealth: Record<number, number>;
  planetPlayers: Record<number, number>;
  attacks: SupplyLine[];
  eventPlanets: Set<number>;
}

export function mapWarStatusDto(dto: WarStatusDtoInput): WarStatusView {
  const planetOwners: Record<number, string> = {};
  const planetHealth: Record<number, number> = {};
  const planetPlayers: Record<number, number> = {};

  for (const status of dto.planetStatus ?? []) {
    planetOwners[status.index] = getFactionFromRace(status.owner);
    planetHealth[status.index] = status.health;
    planetPlayers[status.index] = status.players ?? 0;
  }

  return {
    warId: dto.warId,
    planetOwners,
    planetHealth,
    planetPlayers,
    attacks: (dto.planetAttacks ?? []).map((attack) => ({
      source: attack.source,
      target: attack.target,
    })),
    eventPlanets: new Set(
      (dto.planetEvents ?? []).map((event) => event.planetIndex),
    ),
  };
}

export interface GalaxySummary {
  galaxy: GalaxyStats;
  /** Per-planet stats keyed by planet index for O(1) lookup. */
  planets: Record<number, PlanetStats>;
}

export function mapWarSummaryDto(dto: WarSummaryDtoInput): GalaxySummary {
  const planets: Record<number, PlanetStats> = {};
  for (const planet of dto.planets_stats ?? []) {
    planets[planet.planetIndex] = planet;
  }
  return { galaxy: dto.galaxy_stats, planets };
}

export interface SuperEarthNewsItem {
  id: number;
  published: string;
  type: number;
  message: string;
}

// The raw NewsFeed `Published` value is seconds since the war began, not a unix
// timestamp, so it is anchored to the war start date when one is known.
export function mapNewsFeedItems(
  items: NewsFeedItemDtoInput[],
  warStartDate: string | null,
): SuperEarthNewsItem[] {
  const startMs = warStartDate ? Date.parse(warStartDate) : null;

  return items
    .map((item) => ({
      id: item.Id,
      published:
        startMs === null
          ? new Date(0).toISOString()
          : new Date(startMs + item.Published * 1000).toISOString(),
      type: item.Type ?? 0,
      message: item.Message,
    }))
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
}

function toIso(seconds: number | undefined): string | null {
  if (seconds == null) return null;
  return new Date(seconds * 1000).toISOString();
}

export { getFactionFromRace };
