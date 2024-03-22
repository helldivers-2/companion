"use client";

import {
  MapContainer,
  CircleMarker,
  TileLayer,
  ImageOverlay,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngBounds } from "leaflet";

export default function MyMap() {
  const bounds = new LatLngBounds([-1, -1], [1, 1]);
  return (
    <MapContainer
      center={[0, 0]}
      zoom={8}
      scrollWheelZoom={false}
      className="aspect-video rounded-lg border bg-black"
    >
      <TileLayer url="/tile.webp" />
      <ImageOverlay
        url="/sectormap.webp"
        bounds={bounds}
        opacity={0.5}
        zIndex={10}
      />
      {/*<CircleMarker center={[0, 0]}>
        <Popup>
          Placeholder
        </Popup>
      </CircleMarker>*/}
    </MapContainer>
  );
}
