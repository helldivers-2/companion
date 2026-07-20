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
});

export const WarStatsDtoSchema = z.object({
  statistics: WarStatisticsSchema,
});

export type WarStatsDto = z.infer<typeof WarStatsDtoSchema>;
export type WarStats = z.infer<typeof WarStatisticsSchema>;
