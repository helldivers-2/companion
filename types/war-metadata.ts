import { z } from "zod";

// The raw ArrowHead payloads are numeric and carry far more fields than the
// community wrapper exposes. Only the fields we actually consume are modelled;
// Zod strips the rest, so a new field upstream cannot fail the parse.
export const RaceSchema = z.number();

// ArrowHead's internal race ids. Confirmed against live data: race 3 is the
// Automaton homeworld Cyberstan, race 1 is Super Earth, and planet-events
// report race 3 for Automaton defenses.
export const RACE_FACTION: Record<number, string> = {
  1: "Humans",
  2: "Terminids",
  3: "Automaton",
  4: "Illuminate",
};

export function getFactionFromRace(race: number): string {
  return RACE_FACTION[race] ?? "Unknown";
}

// Region size is an enum in the raw data; index maps to the same labels the
// wrapper's `regions[].size` reports.
export const REGION_SIZE_LABELS = [
  "Settlement",
  "Town",
  "City",
  "MegaCity",
] as const;

export function getRegionSizeLabel(regionSize: number): string | null {
  return REGION_SIZE_LABELS[regionSize] ?? null;
}

export const WarIdDtoSchema = z.object({
  id: z.number(),
});

export const PlanetInfoSchema = z.object({
  index: z.number(),
  sector: z.number().optional(),
  maxHealth: z.number(),
  disabled: z.boolean().optional(),
  initialOwner: z.number().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  waypoints: z.array(z.number()).optional(),
});

export const HomeWorldSchema = z.object({
  race: z.number(),
  planetIndices: z.array(z.number()),
});

export const PlanetRegionInfoSchema = z.object({
  planetIndex: z.number(),
  regionIndex: z.number(),
  settingsHash: z.number().optional(),
  maxHealth: z.number(),
  regionSize: z.number().optional(),
  flags: z.number().optional(),
  damageMultiplier: z.number().optional(),
});

export const WarInfoDtoSchema = z.object({
  warId: z.number(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  minimumClientVersion: z.string().optional(),
  planetInfos: z.array(PlanetInfoSchema),
  homeWorlds: z.array(HomeWorldSchema).optional().default([]),
  planetRegions: z.array(PlanetRegionInfoSchema).optional().default([]),
});

export const PlanetStatusSchema = z.object({
  index: z.number(),
  owner: z.number(),
  health: z.number(),
  regenPerSecond: z.number().optional(),
  players: z.number().optional(),
});

export const PlanetAttackSchema = z.object({
  source: z.number(),
  target: z.number(),
});

export const RawPlanetEventSchema = z.object({
  id: z.number(),
  planetIndex: z.number(),
  eventType: z.number().optional(),
  race: z.number().optional(),
  health: z.number(),
  maxHealth: z.number(),
  campaignId: z.number().optional(),
});

export const PlanetRegionStatusSchema = z.object({
  planetIndex: z.number(),
  regionIndex: z.number(),
  owner: z.number().optional(),
  health: z.number().optional(),
  regerPerSecond: z.number().optional(),
  availabilityFactor: z.number().optional(),
  isAvailable: z.boolean().optional(),
  players: z.number().optional(),
});

export const WarStatusDtoSchema = z.object({
  warId: z.number(),
  time: z.number().optional(),
  impactMultiplier: z.number().optional(),
  planetStatus: z.array(PlanetStatusSchema).optional().default([]),
  planetAttacks: z.array(PlanetAttackSchema).optional().default([]),
  planetEvents: z.array(RawPlanetEventSchema).optional().default([]),
  planetRegions: z.array(PlanetRegionStatusSchema).optional().default([]),
});
export const GalaxyStatsSchema = z.object({
  missionsWon: z.number(),
  missionsLost: z.number(),
  missionTime: z.number(),
  bugKills: z.number(),
  automatonKills: z.number(),
  illuminateKills: z.number(),
  bulletsFired: z.number(),
  bulletsHit: z.number(),
  timePlayed: z.number(),
  deaths: z.number(),
  revives: z.number().optional(),
  friendlies: z.number(),
  missionSuccessRate: z.number(),
  accurracy: z.number().optional(),
});

export const PlanetStatsSchema = GalaxyStatsSchema.extend({
  planetIndex: z.number(),
});

export const WarSummaryDtoSchema = z.object({
  galaxy_stats: GalaxyStatsSchema,
  planets_stats: z.array(PlanetStatsSchema).optional().default([]),
});

export const NewsFeedItemDtoSchema = z.object({
  Id: z.number(),
  Published: z.number(),
  Type: z.number().optional().default(0),
  Message: z.string(),
});

export type WarIdDto = z.infer<typeof WarIdDtoSchema>;
export type PlanetInfo = z.infer<typeof PlanetInfoSchema>;
export type HomeWorld = z.infer<typeof HomeWorldSchema>;
export type PlanetRegionInfo = z.infer<typeof PlanetRegionInfoSchema>;
export type WarInfoDto = z.infer<typeof WarInfoDtoSchema>;
export type PlanetStatus = z.infer<typeof PlanetStatusSchema>;
export type PlanetAttack = z.infer<typeof PlanetAttackSchema>;
export type RawPlanetEvent = z.infer<typeof RawPlanetEventSchema>;
export type PlanetRegionStatus = z.infer<typeof PlanetRegionStatusSchema>;
export type WarStatusDto = z.infer<typeof WarStatusDtoSchema>;
export type GalaxyStats = z.infer<typeof GalaxyStatsSchema>;
export type PlanetStats = z.infer<typeof PlanetStatsSchema>;
export type WarSummaryDto = z.infer<typeof WarSummaryDtoSchema>;
export type NewsFeedItemDto = z.infer<typeof NewsFeedItemDtoSchema>;

// Input shapes accept the fields the schemas default (revives, accuracy, etc.),
// so transformers and test fixtures can omit them while the validated service
// output — which always carries them — remains assignable.
export type WarInfoDtoInput = z.input<typeof WarInfoDtoSchema>;
export type WarStatusDtoInput = z.input<typeof WarStatusDtoSchema>;
export type WarSummaryDtoInput = z.input<typeof WarSummaryDtoSchema>;
export type NewsFeedItemDtoInput = z.input<typeof NewsFeedItemDtoSchema>;
