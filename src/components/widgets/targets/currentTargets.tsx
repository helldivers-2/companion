import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { statusAPI } from "@/components/widgets/util/getApiData";

interface Planet {
  playerCount: number;
  health: number;
  name: string;
  initialOwner: string;
  position: {
    x: number;
    y: number;
  };
}

export default async function TargetsTable() {
  const targets = await statusAPI();

  const flattenedPlanets = targets.map(
    ({
      name,
      health,
      initialOwner,
      statistics,
    }: {
      statistics: { playerCount: string };
      name: string;
      players: number;
      health: number;
      initialOwner: string;
    }) => ({
      name,
      health: health / 10000,
      initialOwner,
      playerCount: statistics.playerCount,
    }),
  );

  const filteredPlanets = flattenedPlanets.filter((planet: Planet) => {
    return planet.playerCount > 500 && planet.health !== 100;
  });

  return <DataTable data={filteredPlanets} columns={columns} />;
}
