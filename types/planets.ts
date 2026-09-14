import { z } from "zod";
import {
  PlanetDtoSchema,
  type PlanetDto,
  type Planet,
} from "@/types/campaigns";

// The /api/v1/planets and /api/v1/planet-events endpoints serve the same planet
// shape as campaigns, so they reuse PlanetDtoSchema rather than duplicating it.
export const PlanetsDtoSchema = z.array(PlanetDtoSchema);

export type PlanetListDto = PlanetDto[];
export { PlanetDtoSchema };

/**
 * A planet as returned by the standalone planets endpoints. It is structurally a
 * `Planet`, but the wrapper exists so callers depending on the galaxy-wide
 * listing don't accidentally couple to the campaign-specific `Campaign` type.
 */
export type GalaxyPlanet = Planet;

export interface GalaxyPlanetStats {
  totalPlanets: number;
  activeEvents: number;
  humanOwned: number;
  enemyOwned: number;
  contested: number;
  totalPlayers: number;
}
