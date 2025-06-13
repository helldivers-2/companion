"use client";

import { MapContainer, ImageOverlay, TileLayer } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function CampaignMap() {
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
    </MapContainer>
  );
}
