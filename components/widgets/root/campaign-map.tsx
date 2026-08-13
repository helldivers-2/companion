"use client";

import {
  getFactionIcon,
  getLiberation,
  getPlanetStats,
  isLiberated,
} from "@/lib/transformers/campaigns";
import { useMemo, useState, useSyncExternalStore } from "react";
import { millify } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/types/campaigns";
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
// Same palette as the table's status badges (Tailwind 500s) so the map and the
// table always agree on what a front is doing.
const COLORS = {
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  muted: "#71717a",
  white: "#FFFFFF",
} as const;

const MARKER_STATUS = {
  EVENT: "event",
  CAMPAIGN: "campaign",
  LIBERATED: "liberated",
} as const;

// Keyed by the semantic token getStatus/getPlanetStats returns, not by the
// label, so renaming a status cannot silently drop a marker back to grey.
const STATUS_COLORS: Record<string, string> = {
  warning: COLORS.orange,
  success: COLORS.green,
  destructive: COLORS.red,
  muted: COLORS.muted,
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
  onPlanetClick?: (campaign: Campaign) => void;
}

const useResponsiveSettings = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return {
    isClient,
    zoom: isMobile ? 7 : 8,
    bounds: getMapBounds(isMobile),
  };
};

const PlanetPopup = ({
  campaign,
  liberation,
}: {
  campaign: Campaign;
  liberation: string;
}) => {
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
              getFactionIcon(campaign.planet.currentOwner) ||
              "/web-app-manifest-192x192.png"
            }
            height={20}
            width={20}
            alt={`${campaign.planet.currentOwner} Icon`}
            className="size-4 shrink-0 object-contain"
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
              {planet.event ? "Event Health" : "Liberation"}
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

const PlanetMarker = ({ campaign, onPlanetClick }: PlanetMarkerProps) => {
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
    if (isLiberated(campaign)) {
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

    const { status } = getPlanetStats(planet);
    const isEvent = planet.event !== null;

    return {
      fillColor: STATUS_COLORS[status.color] ?? COLORS.muted,
      fillOpacity: isEvent ? 0.9 : 0.8,
      color: COLORS.white,
      weight: 2,
      radius: isEvent ? 8 : 7,
      status: isEvent ? MARKER_STATUS.EVENT : MARKER_STATUS.CAMPAIGN,
      statusText: status.text,
      priority: isEvent ? "high" : "medium",
    };
  }, [campaign, planet]);

  const progressRadius = markerProperties.radius + 3;
  const circumference = 2 * Math.PI * progressRadius;
  const liberationPercentage = Number(markerData.liberation);
  const dashArray = `${(liberationPercentage / 100) * circumference} ${circumference - (liberationPercentage / 100) * circumference}`;

  return (
    <div>
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
          click: () => onPlanetClick?.(campaign),
        }}
      >
        <PlanetPopup
          campaign={campaign}
          liberation={markerData.liberation as string}
        />
      </CircleMarker>

      {markerProperties.status !== MARKER_STATUS.LIBERATED && (
        <CircleMarker
          center={markerData.coordinates}
          radius={progressRadius}
          fillColor="transparent"
          fillOpacity={0}
          color={COLORS.white}
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
          onPlanetClick={onPlanetClick}
        />
      ))}
    </FeatureGroup>
  </LayersControl.Overlay>
);

export interface CampaignMapProps {
  movingPlanets: Campaign[];
  parkedPlanets: Campaign[];
  liberatedPlanets: Campaign[];
  error?: string | null;
}

export default function CampaignMap({
  movingPlanets,
  parkedPlanets,
  liberatedPlanets,
  error,
}: CampaignMapProps) {
  const { zoom, bounds, isClient } = useResponsiveSettings();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const handlePlanetClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  // Defenses are the only thing on a timer, so they get their own layer while
  // the rest of the moving fronts share one. Parked fronts and liberated
  // planets stay off by default — the map is for what is actually happening,
  // not for the thirty untouched planets that are technically in the war.
  const defenses = movingPlanets.filter(
    (campaign) => campaign.planet.event !== null,
  );
  const activeCampaigns = movingPlanets.filter(
    (campaign) => campaign.planet.event === null,
  );

  if (!isClient) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-muted-foreground">Initializing map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-none border md:aspect-video">
        <div className="text-center">
          <div className="mb-2 text-red-500">Failed to load campaign data</div>
          <div className="mb-4 text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (
    movingPlanets.length === 0 &&
    parkedPlanets.length === 0 &&
    liberatedPlanets.length === 0
  ) {
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
          {defenses.length > 0 && (
            <PlanetLayer
              planets={defenses}
              name="Active Defenses"
              checked={true}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {activeCampaigns.length > 0 && (
            <PlanetLayer
              planets={activeCampaigns}
              name="Active Campaigns"
              checked={true}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {parkedPlanets.length > 0 && (
            <PlanetLayer
              planets={parkedPlanets}
              name="Parked Fronts"
              checked={movingPlanets.length === 0}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {liberatedPlanets.length > 0 && (
            <PlanetLayer
              planets={liberatedPlanets}
              name="Liberated Planets"
              checked={false}
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
