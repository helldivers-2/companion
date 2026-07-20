import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import {
  SpaceStationDtoSchema,
  type SpaceStationDto,
} from "@/types/space-station";

export async function fetchSpaceStations(): Promise<SpaceStationDto[]> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.SPACE_STATION.url,
    revalidate: ENDPOINTS.SPACE_STATION.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch space stations: ${result.error.message}`);
  }
  return validate(z.array(SpaceStationDtoSchema), result.data, "space station");
}
