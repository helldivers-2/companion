import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SpaceStationDto } from "@/types/space-station";

export async function fetchSpaceStations(): Promise<SpaceStationDto[]> {
  const result = await getAPI<SpaceStationDto[]>({
    url: ENDPOINTS.SPACE_STATION.url,
    revalidate: ENDPOINTS.SPACE_STATION.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch space stations: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid space station data: expected array");
  }
  return result.data;
}
