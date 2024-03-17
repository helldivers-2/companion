"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Planet {
  initial_owner: string;
  max_health: number;
  name: string;
  position: {
    x: number;
    y: number;
  };
  sector: string;
  waypoints: number[];
  players: number;
  regen_per_second: number;
  health: number;
  liberation: number;
  owner: string;
  planet: {
    disabled: boolean;
    hash: number;
    index: number;
    name: string; // Adjusted interface to include planet name
  };
}

const PlanetsTable = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await axios.get(
          "https://helldivers-2.fly.dev/api/801/status",
        );
        const filteredPlanets = response.data.planet_status.filter(
          (planet: Planet) =>
            planet.liberation !== 100.0 && planet.players > 100,
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

  return (
    <table className="">
      <thead>
        <tr>
          <th>Name</th>
          <th>Players</th>
          <th>Liberation</th>
        </tr>
      </thead>
      <tbody>
        {planets.map((planet: Planet) => (
          <tr key={planet.planet.name}>
            <td>{planet.planet.name}</td>
            <td>{planet.players}</td>
            <td>{formatLiberation(planet.liberation)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlanetsTable;
