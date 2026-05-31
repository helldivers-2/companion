import type {
  SpaceStationDto,
  SpaceStation,
  TacticalActionDto,
  TacticalAction,
  CostDto,
  Cost,
} from "@/types/space-station";
import { mapPlanetDto } from "./campaigns";

export function mapCostDto(dto: CostDto): Cost {
  return { ...dto };
}

export function mapTacticalActionDto(dto: TacticalActionDto): TacticalAction {
  return {
    ...dto,
    costs: dto.costs.map(mapCostDto),
  };
}

export function mapSpaceStationDto(dto: SpaceStationDto): SpaceStation {
  return {
    id32: dto.id32,
    planet: mapPlanetDto(dto.planet),
    electionEnd: dto.electionEnd,
    flags: dto.flags,
    tacticalActions: dto.tacticalActions.map(mapTacticalActionDto),
  };
}
