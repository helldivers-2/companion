"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { fetchPlanetsData } from "../util/getWarMap";

interface Planet {
  name: string;
  playerCount: number;
  health: number;
  maxHealth: number;
  initialOwner: string;
  event: any;
  position: {
    x: number;
    y: number;
  };
  liberationPercentage: number;
}

// Transform Planet type into the format expected by DataTable
const transformPlanetData = (planets: Planet[]) => {
  return planets.map((planet) => ({
    players: planet.playerCount,
    liberation: planet.liberationPercentage,
    name: planet.name,
    initial_owner: planet.initialOwner,
  }));
};

export default function TargetsTable() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const planetsData = await fetchPlanetsData();
        setPlanets(planetsData);
      } catch (err) {
        setError("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Filter planets that have players, an active event, or liberation between 0% and 99%
  const eventPlanets = planets.filter((planet) => planet.event !== null);

  const activePlanets = planets.filter(
    (planet) => planet.health < planet.maxHealth,
  );

  const active = [...eventPlanets, ...activePlanets];

  // Transform data to fit DataTable requirements
  const transformedData = transformPlanetData(active);

  return <DataTable data={transformedData} columns={columns} />;
}
