import { statusAPI } from "./getApiData";

interface Planet {
  players: number;
  liberation: number;
  planet: {
    name: string;
    initial_owner: string;
    position: {
      x: number;
      y: number;
    };
  };
}

export async function fetchPlanetsData(): Promise<Planet[]> {
  try {
    const targets = await statusAPI();

    const flattenedPlanets = targets.planet_status.map(
      ({
        players,
        liberation,
        planet,
      }: {
        players: number;
        liberation: number;
        planet: {
          position: { x: number; y: number };
          name: string;
          initial_owner: string;
        };
      }) => ({
        players,
        liberation,
        planet: {
          name: planet.name,
          initial_owner: planet.initial_owner,
          position: { x: planet.position.x, y: planet.position.y },
        },
      })
    );

    return flattenedPlanets;
  } catch (error) {
    console.error("Error fetching planets:", error);
    return []; // Return empty array in case of error
  }
}
