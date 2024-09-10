import axios from "axios";

interface Planet {
  playerCount: number;
  health: number;
  maxHealth: number;
  name: string;
  initialOwner: string;
  position: {
    x: number;
    y: number;
  };
  event: any;
  liberationPercentage: number;
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
        maxHealth,
        initialOwner,
        event,
        statistics,
        position,
      }: {
        name: string;
        players: number;
        health: number;
        maxHealth: number;
        initialOwner: string;
        event: any;
        position: { x: number; y: number };
        statistics: { playerCount: number };
      }) => ({
        name,
        players,
        health,
        maxHealth,
        initialOwner,
        playerCount: statistics.playerCount,
        event,
        liberationPercentage: (health / maxHealth) * 100, // Calculate liberation percentage
        position: { x: position.x, y: position.y },
      }),
    );

    return flattenedPlanets;
  } catch (error) {
    console.error("Error fetching planets:", error);
    return [];
  }
}
