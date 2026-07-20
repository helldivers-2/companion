import type { SpaceStationDto, SpaceStation } from "@/types/space-station";
import { mapPlanetDto } from "./campaigns";

// Only the planet needs mapping to the domain model; tactical actions and their
// costs are structurally identical between DTO and domain, so they pass through.
export function mapSpaceStationDto(dto: SpaceStationDto): SpaceStation {
  return {
    id32: dto.id32,
    planet: mapPlanetDto(dto.planet),
    electionEnd: dto.electionEnd,
    flags: dto.flags,
    tacticalActions: dto.tacticalActions,
  };
}
