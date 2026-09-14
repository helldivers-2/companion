import { cache } from "react";
import {
  fetchSpaceStations,
  fetchSpaceStation,
} from "@/lib/services/space-station";
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

async function _getSpaceStation(
  index: number | string,
): Promise<SpaceStation | null> {
  try {
    const dto = await fetchSpaceStation(index);
    return mapSpaceStationDto(dto);
  } catch (error) {
    console.error(`getSpaceStation(${index}) failed:`, error);
    return null;
  }
}

export const getSpaceStations = cache(_getSpaceStations);
export const getSpaceStation = cache(_getSpaceStation);
