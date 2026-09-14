import { z } from "zod";

export interface Species {
  value: string;
  icon: string;
}

export const PlanetPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// playerCount is the only field every planet is guaranteed to carry; the rest
// of the per-planet war statistics are validated when present but never
// required, so a lean payload from one endpoint won't fail the whole parse.
export const PlanetStatisticsSchema = z.object({
  playerCount: z.number(),
  missionsWon: z.number().optional(),
  missionsLost: z.number().optional(),
  missionTime: z.number().optional(),
  terminidKills: z.number().optional(),
  automatonKills: z.number().optional(),
  illuminateKills: z.number().optional(),
  bulletsFired: z.number().optional(),
  deaths: z.number().optional(),
  friendlies: z.number().optional(),
  missionSuccessRate: z.number().optional(),
});

export const PlanetEventSchema = z.object({
  id: z.number(),
  eventType: z.number(),
  faction: z.string(),
  health: z.number(),
  maxHealth: z.number(),
  startTime: z.string(),
  endTime: z.string(),
});

const BiomeSchema = z.object({ name: z.string(), description: z.string() });
const HazardSchema = z.object({ name: z.string(), description: z.string() });

// Planets are now taken region by region: a planet can sit at full health while
// a city on it is a quarter liberated, so region health is where progress
// actually shows up. `isAvailable` gates whether players can push a region at
// all — locked regions stay pinned at full health regardless of the war effort.
//
// Inactive regions (on planets the war has moved past) report null health and
// regen, and occasionally a null name/description, so those are nullable rather
// than optional. The transformer and progress helpers normalise null to zero.
export const PlanetRegionSchema = z.object({
  name: z.string().nullish(),
  health: z.number().nullish(),
  maxHealth: z.number(),
  size: z.string().optional(),
  regenPerSecond: z.number().nullish(),
  isAvailable: z.boolean().optional(),
  players: z.number().optional(),
});

export const PlanetDtoSchema = z.object({
  index: z.number().optional(),
  name: z.string(),
  sector: z.string(),
  position: PlanetPositionSchema,
  health: z.number(),
  maxHealth: z.number(),
  regenPerSecond: z.number(),
  currentOwner: z.string(),
  initialOwner: z.string(),
  statistics: PlanetStatisticsSchema,
  event: PlanetEventSchema.nullish(),
  biome: BiomeSchema.optional(),
  hazards: z.array(HazardSchema).optional(),
  regions: z.array(PlanetRegionSchema).optional(),
  waypoints: z.array(z.number()).optional(),
  attacking: z.array(z.number()).optional(),
  disabled: z.boolean().optional(),
});

export const CampaignDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  planet: PlanetDtoSchema,
  faction: z.string(),
});

export type PlanetPosition = z.infer<typeof PlanetPositionSchema>;
export type PlanetStatistics = z.infer<typeof PlanetStatisticsSchema>;
export type PlanetEvent = z.infer<typeof PlanetEventSchema>;
export type PlanetRegionDto = z.infer<typeof PlanetRegionSchema>;
export type PlanetDto = z.infer<typeof PlanetDtoSchema>;
export type CampaignDto = z.infer<typeof CampaignDtoSchema>;

// Domain regions carry concrete numbers even when the API reports null for an
// inactive region, so the liberation/leading-region math never has to null-check.
export interface PlanetRegion {
  name: string;
  health: number;
  maxHealth: number;
  size?: string;
  regenPerSecond?: number;
  isAvailable?: boolean;
  players?: number;
}

export interface Planet {
  index?: number;
  name: string;
  sector: string;
  position: PlanetPosition;
  health: number;
  maxHealth: number;
  regenPerSecond: number;
  currentOwner: string;
  initialOwner: string;
  statistics: PlanetStatistics;
  event?: PlanetEvent | null;
  biome?: { name: string; description: string };
  hazards?: { name: string; description: string }[];
  regions?: PlanetRegion[];
  waypoints?: number[];
  attacking?: number[];
  disabled?: boolean;
}

export interface Campaign {
  id?: string | number;
  planet: Planet;
  faction: string;
}

export interface CampaignStats {
  campaigns: Campaign[];
  // Everything still being fought over, ordered by attention. Split into the
  // two buckets below: the map wants all of them, the table renders them
  // differently depending on whether anything is actually happening.
  activePlanets: Campaign[];
  movingPlanets: Campaign[];
  parkedPlanets: Campaign[];
  liberatedPlanets: Campaign[];
  liberatedPlayerCount: number;
}
