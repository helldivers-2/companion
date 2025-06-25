"use client";

import {
  getFactionIcon,
  getLiberation,
  getCampaignStats,
} from "@/lib/get-campaigns";
import { useEffect, useState, useMemo } from "react";
import millify from "millify";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Campaign, CampaignStats } from "@/types/campaigns";

import {
  MapContainer,
  ImageOverlay,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  FeatureGroup,
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

const ANGLE_OFFSET_DEGREES = 90;
const COLORS = {
  green: "#34C759",
  orange: "#FF9500",
  yellow: "#FFCC00",
  red: "#FF3B30",
  white: "#FFFFFF",
} as const;

const MARKER_STATUS = {
  EVENT: "event",
  CAMPAIGN: "campaign",
  LIBERATED: "liberated",
} as const;

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return COLORS.green;
  if (percentage >= 50) return COLORS.orange;
  if (percentage >= 25) return COLORS.yellow;
  return COLORS.red;
};

const transformCoordinates = (
  x: number,
  y: number,
  angleOffset: number,
): [number, number] => {
  const radians = angleOffset * (Math.PI / 180);
  const transformedX = x * Math.cos(radians) - y * Math.sin(-radians);
  const transformedY = x * Math.sin(radians) + y * Math.cos(-radians);
  return [transformedX, transformedY];
};

const getMapBounds = (isMobile: boolean): LatLngBounds => {
  return isMobile
    ? new LatLngBounds([-2, -2], [2, 2])
    : new LatLngBounds([-1.5, -1.5], [1.5, 1.5]);
};

interface MarkerProperties {
  fillColor: string;
  fillOpacity: number;
  color: string;
  weight: number;
  radius: number;
  status: string;
  statusText: string;
  priority: string;
}

interface PlanetMarkerProps {
  campaign: Campaign;
  index: number;
}

const useCampaignData = () => {
  const [activePlanets, setActivePlanets] = useState<Campaign[]>([]);
  const [liberatedPlanets, setLiberatedPlanets] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { activePlanets, liberatedPlanets }: CampaignStats =
          await getCampaignStats();
        setActivePlanets(activePlanets);
        setLiberatedPlanets(liberatedPlanets);
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { activePlanets, liberatedPlanets, isLoading };
};

const useResponsiveSettings = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    isMobile,
    zoom: isMobile ? 7 : 8,
    bounds: getMapBounds(isMobile),
  };
};

const PlanetPopup = ({ campaign }: { campaign: Campaign }) => {
  const { planet } = campaign;
  const campaignLiberation = getLiberation(planet.health, planet.maxHealth);
  const eventLiberation = planet.event
    ? getLiberation(planet.event.health, planet.event.maxHealth, true)
    : null;
  const liberation = planet.event ? eventLiberation : campaignLiberation;

  return (
    <Popup>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg leading-tight font-semibold">
          {planet.name}
          {planet.event && <Badge variant="outline">Event</Badge>}
        </h3>
        <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <Image
            src={
              getFactionIcon(campaign.faction) ||
              "/web-app-manifest-192x192.png"
            }
            height={20}
            width={20}
            alt={`${campaign.faction} Icon`}
            className="size-4"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Patriots
          </span>
          <span className="text-sm font-semibold">
            {millify(planet.statistics.playerCount)}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Liberation
            </span>
            <span className="text-sm font-semibold text-icon">
              {liberation}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-icon transition-all duration-300 ease-out"
              style={{ width: `${liberation}%` }}
            />
          </div>
        </div>
      </div>
    </Popup>
  );
};

const PlanetMarker = ({ campaign, index }: PlanetMarkerProps) => {
  const { planet } = campaign;

  const markerData = useMemo(() => {
    const campaignLiberation = getLiberation(planet.health, planet.maxHealth);
    const eventLiberation = planet.event
      ? getLiberation(planet.event.health, planet.event.maxHealth, true)
      : null;
    const liberation = planet.event ? eventLiberation : campaignLiberation;

    const coordinates = transformCoordinates(
      planet.position.x,
      planet.position.y,
      ANGLE_OFFSET_DEGREES,
    );

    return { liberation, coordinates };
  }, [planet]);

  const markerProperties = useMemo((): MarkerProperties => {
    if (planet.event !== null) {
      return {
        fillColor: COLORS.red,
        fillOpacity: 0.9,
        color: COLORS.white,
        weight: 2,
        radius: 8,
        status: MARKER_STATUS.EVENT,
        statusText: "Active Event",
        priority: "high",
      };
    } else if (planet.health < planet.maxHealth) {
      return {
        fillColor: COLORS.orange,
        fillOpacity: 0.8,
        color: COLORS.white,
        weight: 2,
        radius: 7,
        status: MARKER_STATUS.CAMPAIGN,
        statusText: `${markerData.liberation}% Liberation`,
        priority: "medium",
      };
    } else {
      return {
        fillColor: COLORS.green,
        fillOpacity: 0.7,
        color: COLORS.white,
        weight: 1.5,
        radius: 6,
        status: MARKER_STATUS.LIBERATED,
        statusText: "Liberated",
        priority: "low",
      };
    }
  }, [planet, markerData.liberation]);

  const progressRadius = markerProperties.radius + 3;
  const circumference = 2 * Math.PI * progressRadius;
  const liberationPercentage = Number(markerData.liberation);
  const dashArray = `${(liberationPercentage / 100) * circumference} ${circumference - (liberationPercentage / 100) * circumference}`;

  return (
    <div key={index}>
      <CircleMarker
        center={markerData.coordinates}
        radius={markerProperties.radius}
        fillColor={markerProperties.fillColor}
        fillOpacity={markerProperties.fillOpacity}
        color={markerProperties.color}
        weight={markerProperties.weight}
        interactive={true}
        className="cursor-pointer transition-all duration-200"
      >
        <PlanetPopup campaign={campaign} />
      </CircleMarker>

      {markerProperties.status !== MARKER_STATUS.LIBERATED && (
        <CircleMarker
          center={markerData.coordinates}
          radius={progressRadius}
          fillColor="transparent"
          fillOpacity={0}
          color={getProgressColor(liberationPercentage)}
          weight={3}
          interactive={false}
          dashArray={dashArray}
          dashOffset={`${circumference * 0.25}`}
          className="pointer-events-none animate-pulse"
        />
      )}
    </div>
  );
};

const PlanetLayer = ({
  planets,
  name,
  checked = false,
}: {
  planets: Campaign[];
  name: string;
  checked?: boolean;
}) => (
  <LayersControl.Overlay checked={checked} name={name}>
    <FeatureGroup>
      {planets.map((campaign, index) => (
        <PlanetMarker
          key={`${campaign.planet.name}-${index}`}
          campaign={campaign}
          index={index}
        />
      ))}
    </FeatureGroup>
  </LayersControl.Overlay>
);

export default function CampaignMap() {
  const { activePlanets, liberatedPlanets, isLoading } = useCampaignData();
  const { zoom, bounds } = useResponsiveSettings();

  if (isLoading) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border md:aspect-video">
        <div className="text-muted-foreground">Loading campaign data...</div>
      </div>
    );
  }

  return (
    <MapContainer
      className="aspect-square rounded-lg border md:aspect-video"
      center={[0, 0]}
      zoom={zoom}
      maxZoom={9}
      minZoom={7}
      maxBounds={bounds}
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
        <PlanetLayer
          planets={activePlanets}
          name="Active Campaigns"
          checked={true}
        />
        <PlanetLayer planets={liberatedPlanets} name="Liberated Planets" />
      </LayersControl>
    </MapContainer>
  );
}
