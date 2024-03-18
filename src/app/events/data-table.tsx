"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const DataTablePlanets = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await axios.get(
          "https://helldivers-2.fly.dev/api/801/status",
        );
        const filteredPlanets = response.data.planet_status.filter(
          (planet: Planet) => planet.players > 5000,
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
    <div className="w-full rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Planet</TableHead>

            <TableHead>Player Count</TableHead>
            <TableHead>Liberation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planets.map((planet: Planet) => (
            <TableRow key={planet.planet.name}>
              <TableCell>{planet.planet.name}</TableCell>
              <TableCell>{planet.players}</TableCell>
              <TableCell>{formatLiberation(planet.liberation)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mx-4 flex items-center justify-end space-x-2 py-4">
        <div className="4 flex-1 text-sm text-muted-foreground">
          Total Players: {calculateTotalPlayers()}
        </div>
        <div className="text-sm text-muted-foreground">
          <a href="https://github.com/dealloc/helldivers2-api">Source</a>
        </div>
      </div>
    </div>
  );
};

export default DataTablePlanets;
