import type { WarStatsDto, WarStats } from "@/types/war";

export function mapWarStatsDto(dto: WarStatsDto): WarStats {
  return dto.statistics;
}
