import { z } from "zod";

export const WarStatisticsSchema = z.object({
  playerCount: z.number(),
  missionSuccessRate: z.number(),
  missionsWon: z.number(),
  missionTime: z.number(),
  terminidKills: z.number(),
  automatonKills: z.number(),
  illuminateKills: z.number(),
  bulletsFired: z.number(),
  deaths: z.number(),
  friendlies: z.number(),
  missionsLost: z.number(),
  // Present in the live payload but not part of the original model; optional so
  // older fixtures and leaner responses still validate.
  bulletsHit: z.number().optional(),
  timePlayed: z.number().optional(),
  revives: z.number().optional(),
  accuracy: z.number().optional(),
});

export const WarStatsDtoSchema = z.object({
  started: z.string().optional(),
  ended: z.string().optional(),
  now: z.string().optional(),
  clientVersion: z.string().optional(),
  factions: z.array(z.string()).optional(),
  impactMultiplier: z.number().optional(),
  statistics: WarStatisticsSchema,
});

export type WarStatsDto = z.infer<typeof WarStatsDtoSchema>;
export type WarStatsDtoInput = z.input<typeof WarStatsDtoSchema>;
export type WarStats = z.infer<typeof WarStatisticsSchema>;
export type WarInfo = {
  started: string | null;
  ended: string | null;
  now: string | null;
  clientVersion: string | null;
  factions: string[];
  impactMultiplier: number | null;
  statistics: WarStats;
};
