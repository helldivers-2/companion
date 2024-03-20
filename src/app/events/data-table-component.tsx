"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

interface Planet {
  players: number;
  liberation: number;
  planet: {
    name: string;
    initial_owner: string;
  };
}

const TargetsTableComponent = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await axios.get(
          "https://helldivers-2.fly.dev/api/801/status",
        );
        const flattenedPlanets = response.data.planet_status.map(
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
          (planet: { players: number }) => planet.players > 5000,
        );
        setPlanets(filteredPlanets);
      } catch (error) {
        console.error("Error fetching planets:", error);
      }
    };

    fetchPlanets();
  }, []);

  const formatLiberation = (liberation: number) => {
    return liberation.toFixed(1); // Rounds to one decimal place
  };

  const calculateTotalPlayers = () => {
    let totalPlayers = 0;
    planets.forEach((planet) => {
      totalPlayers += planet.players;
    });
    return totalPlayers;
  };

  return (
    <>
      <div className="mx-2 flex justify-between text-muted-foreground">
        {calculateTotalPlayers()} People on {planets.length} planets
        <a href="https://github.com/dealloc/helldivers2-api">Source</a>
      </div>
      <DataTable data={planets} columns={columns} />{" "}
    </>
  );
};
{
  /* Data Table mit Pagination und Sortieroption! */
}

export default TargetsTableComponent;
