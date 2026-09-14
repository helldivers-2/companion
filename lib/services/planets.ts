import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import { PlanetDtoSchema, type PlanetDto } from "@/types/campaigns";

async function fetchPlanetList(
  endpoint: { url: string; revalidate: number },
  label: string,
): Promise<PlanetDto[]> {
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch ${label}: ${result.error.message}`);
  }
  return validate(z.array(PlanetDtoSchema), result.data, label);
}

export async function fetchPlanets(): Promise<PlanetDto[]> {
  return fetchPlanetList(ENDPOINTS.PLANETS, "planets");
}

export async function fetchPlanetEvents(): Promise<PlanetDto[]> {
  return fetchPlanetList(ENDPOINTS.PLANET_EVENTS, "planet events");
}

export async function fetchPlanet(index: number | string): Promise<PlanetDto> {
  const endpoint = ENDPOINTS.PLANET(index);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch planet ${index}: ${result.error.message}`);
  }
  return validate(PlanetDtoSchema, result.data, "planet");
}
