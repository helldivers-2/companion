"use client";

import {
  getFactionIcon,
  getLiberation,
  getCampaignStats,
} from "@/lib/get-campaigns";
import { useEffect, useState, useMemo } from "react";
import { millify } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Campaign, CampaignStats } from "@/types/campaigns";
import PlanetDetail from "@/components/planet-detail";
import { useMediaQuery } from "@/lib/use-media-query";

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
  onPlanetClick?: (campaign: Campaign) => void;
}

const useCampaignData = () => {
  const [activePlanets, setActivePlanets] = useState<Campaign[]>([]);
  const [liberatedPlanets, setLiberatedPlanets] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const retry = () => setRetryTrigger((n) => n + 1);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { activePlanets, liberatedPlanets }: CampaignStats =
          await getCampaignStats();

        if (isMounted) {
          setActivePlanets(activePlanets);
          setLiberatedPlanets(liberatedPlanets);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);

        if (isMounted) {
          setError(String(error));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  return {
    activePlanets,
    liberatedPlanets,
    isLoading,
    error,
    retry,
  };
};

const useResponsiveSettings = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return {
    isClient,
    zoom: isMobile ? 7 : 8,
    bounds: getMapBounds(isMobile),
  };
};

const PlanetPopup = ({ campaign, liberation }: { campaign: Campaign; liberation: string }) => {
  const { planet } = campaign;

  return (
    <Popup>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg leading-tight font-semibold">
          {planet.name}
          {planet.event && <Badge variant="outline">Event</Badge>}
        </h3>
        <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-none bg-muted">
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

const PlanetMarker = ({ campaign, index, onPlanetClick }: PlanetMarkerProps) => {
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
  }, [planet.event, planet.health, planet.maxHealth, markerData.liberation]);

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
        eventHandlers={{
          dblclick: () => onPlanetClick?.(campaign),
        }}
      >
        <PlanetPopup campaign={campaign} liberation={markerData.liberation as string} />
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
  onPlanetClick,
}: {
  planets: Campaign[];
  name: string;
  checked?: boolean;
  onPlanetClick?: (campaign: Campaign) => void;
}) => (
  <LayersControl.Overlay checked={checked} name={name}>
    <FeatureGroup>
      {planets.map((campaign, index) => (
        <PlanetMarker
          key={`${campaign.planet.name}-${index}`}
          campaign={campaign}
          index={index}
          onPlanetClick={onPlanetClick}
        />
      ))}
    </FeatureGroup>
  </LayersControl.Overlay>
);

export default function CampaignMap() {
  const {
    activePlanets,
    liberatedPlanets,
    isLoading,
    error,
    retry,
  } = useCampaignData();
  const { zoom, bounds, isClient } = useResponsiveSettings();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handlePlanetClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  if (!isClient) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-muted-foreground">Initializing map...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-center">
          <div className="mb-2 text-muted-foreground">
            Loading campaign data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-center">
          <div className="mb-2 text-red-500">Failed to load campaign data</div>
          <div className="mb-4 text-sm text-muted-foreground">{error}</div>
          <button
            onClick={retry}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activePlanets.length === 0 && liberatedPlanets.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-center">
          <div className="mb-2 text-muted-foreground">
            No campaign data available
          </div>
          <div className="text-sm text-muted-foreground">
            There are currently no active campaigns or liberated planets to
            display.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <MapContainer
      className="aspect-square rounded-none border md:aspect-video"
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
        {activePlanets.length > 0 && (
          <PlanetLayer
            planets={activePlanets}
            name="Active Campaigns"
            checked={true}
            onPlanetClick={handlePlanetClick}
          />
        )}
        {liberatedPlanets.length > 0 && (
          <PlanetLayer
            planets={liberatedPlanets}
            name="Liberated Planets"
            checked={activePlanets.length === 0}
            onPlanetClick={handlePlanetClick}
          />
        )}
      </LayersControl>
    </MapContainer>

    <PlanetDetail
      campaign={selectedCampaign}
      open={detailOpen}
      onOpenChange={setDetailOpen}
    />
    </>
  );
}
