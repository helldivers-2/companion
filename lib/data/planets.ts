import { cache } from "react";
import {
  fetchPlanets,
  fetchPlanetEvents,
  fetchPlanet,
} from "@/lib/services/planets";
import { mapGalaxyPlanetDto } from "@/lib/transformers/planets";
import type { Planet } from "@/types/campaigns";

async function _getPlanets(): Promise<Planet[] | null> {
  try {
    const dtos = await fetchPlanets();
    return dtos.map(mapGalaxyPlanetDto);
  } catch (error) {
    console.error("getPlanets failed:", error);
    return null;
  }
}

async function _getPlanetEvents(): Promise<Planet[] | null> {
  try {
    const dtos = await fetchPlanetEvents();
    return dtos.map(mapGalaxyPlanetDto);
  } catch (error) {
    console.error("getPlanetEvents failed:", error);
    return null;
  }
}

async function _getPlanet(index: number | string): Promise<Planet | null> {
  try {
    const dto = await fetchPlanet(index);
    return mapGalaxyPlanetDto(dto);
  } catch (error) {
    console.error(`getPlanet(${index}) failed:`, error);
    return null;
  }
}

export const getPlanets = cache(_getPlanets);
export const getPlanetEvents = cache(_getPlanetEvents);
export const getPlanet = cache(_getPlanet);
