import { cache } from "react";
import { fetchSpaceStations } from "@/lib/services/space-station";
import { mapSpaceStationDto } from "@/lib/transformers/space-station";
import type { SpaceStation } from "@/types/space-station";

async function _getSpaceStations(): Promise<SpaceStation[] | null> {
  try {
    const dtos = await fetchSpaceStations();
    return dtos.map(mapSpaceStationDto);
  } catch (error) {
    console.error("getSpaceStations failed:", error);
    return null;
  }
}

export const getSpaceStations = cache(_getSpaceStations);
