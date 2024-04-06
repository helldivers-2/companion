import { statusAPI } from "@/components/widgets/util/getApiData";

interface Planet {
  players: number;
  liberation: number;
  planet: {
    name: string;
    index: number;
    initial_owner: string;
    waypoints: number;
    position: {
      x: number;
      y: number;
    };
  };
}

export async function fetchStatusData(): Promise<Planet[]> {
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
          name: string;
          index: number;
          position: { x: number; y: number };
          waypoints: number
        initial_owner: string;
};
      }) => ({
        name: planet.name,
        index: planet.index,
        players,
        liberation,
        initial_owner: planet.initial_owner,
        planet: {
          name: planet.name,
          initial_owner: planet.initial_owner,
          position: { x: planet.position.x, y: planet.position.y },
          waypoints: planet.waypoints
        },
      }),
    );

    return flattenedPlanets;
  } catch (error) {
    console.error("Error fetching planets:", error);
    return [];
  }
}
