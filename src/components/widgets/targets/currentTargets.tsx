import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { statusAPI } from "@/components/widgets/util/getApiData";

export default async function TargetsTable() {
  const targets = await statusAPI();

  const flattenedPlanets = targets.planet_status.map(
    ({
      planet,
      players,
      liberation,
      initial_owner,
    }: {
      planet: { name: string; initial_owner: string };
      players: number;
      liberation: number;
      initial_owner: string;
    }) => ({
      name: planet.name,
      players,
      liberation,
      initial_owner: planet.initial_owner,
    }),
  );

  const filteredPlanets = flattenedPlanets.filter(
    (planet: { players: number; liberation: number }) => {
      return planet.players > 500 && planet.liberation !== 100;
    },
  );

  return <DataTable data={filteredPlanets} columns={columns} />;
}
