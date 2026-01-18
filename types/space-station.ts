import type { Planet } from "./campaigns";

export interface SpaceStation {
  id32: number;
  planet: Planet;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalAction[];
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

export interface Cost {
  id: string;
  targetValue: number;
  currentValue: number;
  deltaPerSecond: number;
}
