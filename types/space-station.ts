import type { PlanetDto, Planet } from "./campaigns";

export interface CostDto {
  id: string;
  targetValue: number;
  currentValue: number;
  deltaPerSecond: number;
}

export interface TacticalActionDto {
  id32: number;
  name: string;
  description: string;
  strategicDescription: string;
  status: number;
  statusExpire: string;
  costs: CostDto[];
}

export interface SpaceStationDto {
  id32: number;
  planet: PlanetDto;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalActionDto[];
}

export interface Cost {
  id: string;
  targetValue: number;
  currentValue: number;
  deltaPerSecond: number;
}

export interface TacticalAction {
  id32: number;
  name: string;
  description: string;
  strategicDescription: string;
  status: number;
  statusExpire: string;
  costs: Cost[];
}

export interface SpaceStation {
  id32: number;
  planet: Planet;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalAction[];
}
