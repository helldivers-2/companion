"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  ImageOverlay,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngBounds } from "leaflet";
import axios from "axios";

import { Progress } from "./ui/progress";

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

export default function MyMap() {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    const fetchPlanetsData = async () => {
      try {
        const response = await axios.get(
          "https://helldivers-2.fly.dev/api/801/status",
        );

        const flattenedPlanets = response.data.planet_status.map(
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
          }),
        );
        const filteredPlanets = flattenedPlanets.filter(
          (planet: { players: number; liberation: number }) => {
            return planet.players > 2000 && planet.liberation !== 100;
          },
        );
        setPlanets(filteredPlanets);
      } catch (error) {
        console.error("Error fetching planets:", error);
      }
    };
    fetchPlanetsData();
  }, []);

  // Define the angle offset in degrees
  const angleOffsetDegrees = 90; // Adjust as needed

  const renderPlanetMarkers = (): JSX.Element[] => {
    return planets.map((planet, index) => {
      // Calculate new coordinates with angle offset
      const newX =
        planet.planet.position.x *
          Math.cos(angleOffsetDegrees * (Math.PI / 180)) -
        planet.planet.position.y *
          Math.sin(angleOffsetDegrees * (Math.PI / 180));
      const newY =
        planet.planet.position.x *
          Math.sin(angleOffsetDegrees * (Math.PI / 180)) +
        planet.planet.position.y *
          Math.cos(angleOffsetDegrees * (Math.PI / 180));

      let fillColor = "gray";
      let color = "gray";

      if (planet.liberation < 10) {
        fillColor = "red";
        color = "yellow";
      } else if (planet.liberation < 100) {
        fillColor = "red";
        color = "red";
      } else {
        fillColor = "green";
        color = "green";
      }

      return (
        <CircleMarker
          key={index}
          center={[
            newX / -100, // Divide by 100 if necessary
            newY / 100, // Divide by 100 if necessary
          ]}
          radius={5}
          fillColor={fillColor}
          color={color}
          weight={1}
        >
          <Popup>
            <p>Name: {planet.planet.name}</p>
            <p>Players: {planet.players}</p>
            <p>
              Liberation: <Progress value={planet.liberation} />
            </p>
          </Popup>
        </CircleMarker>
      );
    });
  };

  return (
    <MapContainer
      className="aspect-video rounded-lg border"
      center={[0, 0]}
      zoom={8}
      maxZoom={9}
      minZoom={7}
      boxZoom={false}
      doubleClickZoom={false}
      dragging={false}
      keyboard={false}
      scrollWheelZoom={false}
      touchZoom={false}
    >
      <TileLayer url="/tile.webp" />
      <ImageOverlay
        url="/sectormap.webp"
        bounds={new LatLngBounds([-1, -1], [1, 1])}
      />
      {renderPlanetMarkers()}
    </MapContainer>
  );
}

{
  /*      maxZoom={9}
      minZoom={7}
      boxZoom={false}
      doubleClickZoom={false}
      dragging={false}
      keyboard={false}
      scrollWheelZoom={false}
      touchZoom={false} */
}
