import axios from "axios";

interface Planet {
  playerCount: number;
  health: number;
  name: string;
  initialOwner: string;
  position: {
    x: number;
    y: number;
  };
  event: any;
}

export async function fetchPlanetsData(): Promise<Planet[]> {
  try {
    const response = await axios.get(
      "https://api.helldivers2.dev/api/v1/planets",
    );

    const flattenedPlanets = response.data.map(
      ({
        name,
        players,
        health,
        initialOwner,
        statistics,
        position,
      }: {
        statistics: { playerCount: string };
        name: string;
        players: number;
        health: number;
        initialOwner: string;
        position: { x: number; y: number };
      }) => ({
        name,
        players,
        health: health / 10000,
        initialOwner,
        playerCount: statistics.playerCount,
        position: { x: position.x, y: position.y },
      }),
    );

    return flattenedPlanets;
  } catch (error) {
    console.error("Error fetching planets:", error);
    return [];
  }
}
