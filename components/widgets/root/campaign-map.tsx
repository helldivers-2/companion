"use client";

import {
  getFactionIcon,
  getLiberation,
  getPlanetStats,
  isLiberated,
} from "@/lib/transformers/campaigns";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Map as MapIcon } from "lucide-react";
import { millify } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/types/campaigns";
import type { CampaignSupplyLine } from "@/lib/transformers/campaigns";
import type { AttackLine } from "@/lib/transformers/war-metadata";
import PlanetDetail from "@/components/planet-detail";
import { WidgetState } from "@/components/widgets/widget-state";
import { useMediaQuery } from "@/lib/use-media-query";

import {
  MapContainer,
  ImageOverlay,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  LayersControl,
  FeatureGroup,
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

const ANGLE_OFFSET_DEGREES = 90;
const WHITE = "#FFFFFF";

interface MapPalette {
  success: string;
  warning: string;
  destructive: string;
  muted: string;
}

// Leaflet writes colors into SVG attributes, where var() does not resolve, so
// the theme tokens are read off the root element instead. They are the same
// tokens the table's status badges use, so the map and the table always agree
// on what a front is doing.
const readPalette = (): MapPalette => {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    success: token("--success", "#16a34a"),
    warning: token("--warning", "#c2410c"),
    destructive: token("--destructive", "#dc2626"),
    muted: token("--muted-foreground", "#71717a"),
  };
};

// Keyed by the semantic token getStatus/getPlanetStats returns, not by the
// label, so renaming a status cannot silently drop a marker back to grey.
const statusColor = (palette: MapPalette, token: string): string =>
  palette[token as keyof MapPalette] ?? palette.muted;

const MARKER_STATUS = {
  EVENT: "event",
  CAMPAIGN: "campaign",
  LIBERATED: "liberated",
} as const;

const LEGEND_MARKERS = [
  { label: "Defending", className: "bg-warning" },
  { label: "Liberating", className: "bg-success" },
  { label: "Counterattacking", className: "bg-destructive" },
  { label: "Stable", className: "bg-muted-foreground" },
] as const;

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
  palette: MapPalette;
  onPlanetClick?: (campaign: Campaign) => void;
}

const useResponsiveSettings = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return {
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

const PlanetMarker = ({
  campaign,
  palette,
  onPlanetClick,
}: PlanetMarkerProps) => {
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
        fillColor: palette.success,
        fillOpacity: 0.7,
        color: WHITE,
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
      fillColor: statusColor(palette, status.color),
      fillOpacity: isEvent ? 0.9 : 0.8,
      color: WHITE,
      weight: 2,
      radius: isEvent ? 8 : 7,
      status: isEvent ? MARKER_STATUS.EVENT : MARKER_STATUS.CAMPAIGN,
      statusText: status.text,
      priority: isEvent ? "high" : "medium",
    };
  }, [campaign, planet, palette]);

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
          color={WHITE}
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
  palette,
  checked = false,
  onPlanetClick,
}: {
  planets: Campaign[];
  name: string;
  palette: MapPalette;
  checked?: boolean;
  onPlanetClick?: (campaign: Campaign) => void;
}) => (
  <LayersControl.Overlay checked={checked} name={name}>
    <FeatureGroup>
      {planets.map((campaign, index) => (
        <PlanetMarker
          key={`${campaign.planet.name}-${index}`}
          campaign={campaign}
          palette={palette}
          onPlanetClick={onPlanetClick}
        />
      ))}
    </FeatureGroup>
  </LayersControl.Overlay>
);

const MapLegend = () => (
  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {LEGEND_MARKERS.map(({ label, className }) => (
      <li key={label} className="flex items-center gap-1.5">
        <span aria-hidden className={`size-2.5 rounded-full ${className}`} />
        {label}
      </li>
    ))}
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-3 rounded-full border-2 border-foreground/60"
      />
      Outer ring: progress
    </li>
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="w-4 border-t border-dashed border-muted-foreground"
      />
      Supply line
    </li>
    <li className="flex items-center gap-1.5">
      <span aria-hidden className="w-4 border-t-2 border-destructive" />
      Enemy attack
    </li>
  </ul>
);

export interface CampaignMapProps {
  movingPlanets: Campaign[];
  parkedPlanets: Campaign[];
  liberatedPlanets: Campaign[];
  supplyLines?: CampaignSupplyLine[];
  attackLines?: AttackLine[];
  error?: string | null;
}

export default function CampaignMap({
  movingPlanets,
  parkedPlanets,
  liberatedPlanets,
  supplyLines = [],
  attackLines = [],
  error,
}: CampaignMapProps) {
  const { zoom, bounds } = useResponsiveSettings();
  // Subscribing to the theme re-renders the map when the .dark class flips,
  // which is when readPalette picks up the other set of token values.
  useTheme();
  const palette = readPalette();
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

  if (error) {
    return (
      <div className="flex aspect-square items-center justify-center border md:aspect-video">
        <WidgetState
          icon={MapIcon}
          title="Unable to load the galactic map"
          description={error}
        />
      </div>
    );
  }

  if (
    movingPlanets.length === 0 &&
    parkedPlanets.length === 0 &&
    liberatedPlanets.length === 0
  ) {
    return (
      <div className="flex aspect-square items-center justify-center border md:aspect-video">
        <WidgetState
          icon={MapIcon}
          title="No campaign data available"
          description="There are currently no active campaigns or liberated planets to display."
        />
      </div>
    );
  }

  return (
    <>
      {/* Scroll-wheel zoom stays off so the page scrolls past the map; pinch
          and keyboard zoom match the visible +/- controls. */}
      <MapContainer
        className="aspect-square rounded-none border md:aspect-video"
        center={[0, 0]}
        zoom={zoom}
        maxZoom={9}
        minZoom={7}
        maxBounds={bounds}
        boxZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
      >
        <TileLayer url="/tile.webp" />
        <ImageOverlay
          url="/sectormap.webp"
          bounds={new LatLngBounds([-1, -1], [1, 1])}
          opacity={0.5}
        />
        <LayersControl position="bottomleft">
          {supplyLines.length > 0 && (
            <LayersControl.Overlay checked={true} name="Supply Lines">
              <FeatureGroup>
                {supplyLines.map((line, index) => (
                  <Polyline
                    key={`${line.from.index}-${line.to.index}-${index}`}
                    positions={[
                      transformCoordinates(
                        line.from.position.x,
                        line.from.position.y,
                        ANGLE_OFFSET_DEGREES,
                      ),
                      transformCoordinates(
                        line.to.position.x,
                        line.to.position.y,
                        ANGLE_OFFSET_DEGREES,
                      ),
                    ]}
                    pathOptions={{
                      color: palette.muted,
                      weight: 1,
                      opacity: 0.4,
                      dashArray: "4 4",
                    }}
                    interactive={false}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
          {attackLines.length > 0 && (
            <LayersControl.Overlay checked={true} name="Enemy Attacks">
              <FeatureGroup>
                {attackLines.map((line, index) => (
                  <Polyline
                    key={`attack-${index}`}
                    positions={[
                      transformCoordinates(
                        line.from.x,
                        line.from.y,
                        ANGLE_OFFSET_DEGREES,
                      ),
                      transformCoordinates(
                        line.to.x,
                        line.to.y,
                        ANGLE_OFFSET_DEGREES,
                      ),
                    ]}
                    pathOptions={{
                      color: palette.destructive,
                      weight: 2,
                      opacity: 0.6,
                    }}
                    interactive={false}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
          {defenses.length > 0 && (
            <PlanetLayer
              planets={defenses}
              name="Active Defenses"
              palette={palette}
              checked={true}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {activeCampaigns.length > 0 && (
            <PlanetLayer
              planets={activeCampaigns}
              name="Active Campaigns"
              palette={palette}
              checked={true}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {parkedPlanets.length > 0 && (
            <PlanetLayer
              planets={parkedPlanets}
              name="Parked Fronts"
              palette={palette}
              checked={movingPlanets.length === 0}
              onPlanetClick={handlePlanetClick}
            />
          )}
          {liberatedPlanets.length > 0 && (
            <PlanetLayer
              planets={liberatedPlanets}
              name="Liberated Planets"
              palette={palette}
              checked={false}
              onPlanetClick={handlePlanetClick}
            />
          )}
        </LayersControl>
      </MapContainer>

      <MapLegend />

      <PlanetDetail
        campaign={selectedCampaign}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
