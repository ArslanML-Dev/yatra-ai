"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Coordinates, Place } from "@/types/place";
import { getMapProvider } from "@/lib/providers/provider-registry";
import { MarkerPopup } from "./MarkerPopup";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

interface MapViewProps {
  places: Place[];
  center: Coordinates;
}

export function MapView({ places, center }: MapViewProps) {
  const mapProvider = getMapProvider();
  const tileConfig = mapProvider.getTileConfig();
  const markers = mapProvider.toMarkers(places);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer url={tileConfig.url} attribution={tileConfig.attribution} />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.coordinates.lat, marker.coordinates.lng]}>
          <Popup>
            <MarkerPopup place={marker.place} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
