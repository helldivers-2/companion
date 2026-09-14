import type { WarStatsDto, WarStatsDtoInput, WarStats, WarInfo } from "@/types/war";

// Statistics-only view, retained for the summary/statistics widgets that only
// need the counters.
export function mapWarStatsDto(dto: WarStatsDtoInput): WarStats {
  return dto.statistics;
}

// Full war state: the counters plus the season window, factions and impact
// multiplier that the /v1/war payload carries alongside them.
export function mapWarDto(dto: WarStatsDtoInput): WarInfo {
  return {
    started: dto.started ?? null,
    ended: dto.ended ?? null,
    now: dto.now ?? null,
    clientVersion: dto.clientVersion ?? null,
    factions: dto.factions ?? [],
    impactMultiplier: dto.impactMultiplier ?? null,
    statistics: dto.statistics,
  };
}
