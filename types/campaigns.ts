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

export const PlanetDtoSchema = z.object({
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
});

export const CampaignDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  planet: PlanetDtoSchema,
  faction: z.string(),
});

export type PlanetPosition = z.infer<typeof PlanetPositionSchema>;
export type PlanetStatistics = z.infer<typeof PlanetStatisticsSchema>;
export type PlanetEvent = z.infer<typeof PlanetEventSchema>;
export type PlanetDto = z.infer<typeof PlanetDtoSchema>;
export type CampaignDto = z.infer<typeof CampaignDtoSchema>;

export interface Planet {
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
}

export interface Campaign {
  id?: string | number;
  planet: Planet;
  faction: string;
}

export interface CampaignStats {
  campaigns: Campaign[];
  activePlanets: Campaign[];
  liberatedPlanets: Campaign[];
  liberatedPlayerCount: number;
}
