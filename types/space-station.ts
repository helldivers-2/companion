import { z } from "zod";
import { PlanetDtoSchema, type Planet } from "./campaigns";

export const CostDtoSchema = z.object({
  id: z.string(),
  targetValue: z.number(),
  currentValue: z.number(),
  deltaPerSecond: z.number(),
});

export const TacticalActionDtoSchema = z.object({
  id32: z.number(),
  name: z.string(),
  description: z.string(),
  strategicDescription: z.string(),
  status: z.number(),
  statusExpire: z.string(),
  costs: z.array(CostDtoSchema),
});

export const SpaceStationDtoSchema = z.object({
  id32: z.number(),
  planet: PlanetDtoSchema,
  electionEnd: z.string(),
  flags: z.number(),
  tacticalActions: z.array(TacticalActionDtoSchema),
});

export type CostDto = z.infer<typeof CostDtoSchema>;
export type TacticalActionDto = z.infer<typeof TacticalActionDtoSchema>;
export type SpaceStationDto = z.infer<typeof SpaceStationDtoSchema>;

export type Cost = CostDto;
export type TacticalAction = TacticalActionDto;

export interface SpaceStation {
  id32: number;
  planet: Planet;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalAction[];
}
