"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  ImageOverlay,
  Popup,
  LayersControl,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngBounds } from "leaflet";
import { fetchPlanetsData } from "@/components/widgets/util/getWarMap"; // Ensure this function is correctly implemented
import { Progress } from "../ui/progress";
import { formatNumber } from "@/components/widgets/globalStats";

interface Status {
  playerCount: number;
  health: number;
  maxHealth: number;
  name: string;
  initialOwner: string;
  position: {
    x: number;
    y: number;
  };
  event: any; // Adjust type if necessary
  liberationPercentage: number;
}

export default function MyMap() {
  const [planets, setPlanets] = useState<Status[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const planetsData = await fetchPlanetsData(); // Call the fetchPlanetsData function
      setPlanets(planetsData);
    };
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const allPlanets = planets;

  const eventPlanets = planets.filter(
    (planet: Status) => planet.event !== null,
  );

  const activePlanets = planets.filter(
    (planet: Status) => planet.health < planet.maxHealth,
  );

  const active = [...eventPlanets, ...activePlanets];

  const liberatedPlanets = planets.filter(
    (planet: Status) => planet.health === planet.maxHealth,
  );

  const angleOffsetDegrees = 90;

  const renderPlanetMarkers = (filteredPlanets: Status[]): JSX.Element[] => {
    return filteredPlanets.map((planet, index) => {
      const newX =
        planet.position.x * Math.cos(angleOffsetDegrees * (Math.PI / 180)) -
        planet.position.y * Math.sin(angleOffsetDegrees * (Math.PI / -180));
      const newY =
        planet.position.x * Math.sin(angleOffsetDegrees * (Math.PI / 180)) +
        planet.position.y * Math.cos(angleOffsetDegrees * (Math.PI / -180));

      let fillColor = "";
      let fillOpacity = 0;
      let color = "";
      let radius = 5;

      if (planet.health < planet.maxHealth) {
        fillColor = "red";
        fillOpacity = 0.6;
        color = "red";
        radius = 6;
      } else {
        fillColor = "yellow";
        fillOpacity = 0.4;
        color = "yellow";
        radius = 4;
      }

      if (planet.event !== null) {
        fillColor = "red";
        fillOpacity = 1;
        color = "red";
        radius = 6;
      }

      return (
        <CircleMarker
          key={index}
          center={[newX, newY]}
          radius={radius}
          fillColor={fillColor}
          fillOpacity={fillOpacity}
          color={color}
          weight={1}
        >
          <Popup>
            <p>Name: {planet.name}</p>
            <p>Players: {formatNumber(planet.playerCount)}</p>
            <p>
              {Math.round(planet.liberationPercentage)}% Liberation
              <Progress value={planet.liberationPercentage} />
            </p>
          </Popup>
        </CircleMarker>
      );
    });
  };

  return (
    <MapContainer
      className="aspect-square rounded-lg border md:aspect-video"
      center={[0, 0]}
      zoom={window.innerWidth < 768 ? 7 : 8}
      maxZoom={9}
      minZoom={7}
      maxBounds={
        window.innerWidth < 768
          ? new LatLngBounds([-2, -2], [2, 2])
          : new LatLngBounds([-1.5, -1.5], [1.5, 1.5])
      }
      boxZoom={false}
      doubleClickZoom={false}
      keyboard={false}
      scrollWheelZoom={false}
      touchZoom={false}
    >
      <TileLayer url="/tile.webp" />
      <ImageOverlay
        url="/sectormap.webp"
        bounds={new LatLngBounds([-1, -1], [1, 1])}
        opacity={0.5}
      />
      <LayersControl position="bottomleft">
        <LayersControl.Overlay name="All Planets">
          <FeatureGroup>{renderPlanetMarkers(allPlanets)}</FeatureGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Active Planets">
          <FeatureGroup>{renderPlanetMarkers(active)}</FeatureGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Inactive Planets">
          <FeatureGroup>{renderPlanetMarkers(liberatedPlanets)}</FeatureGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
