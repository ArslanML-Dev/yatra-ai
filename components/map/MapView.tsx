"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Coordinates, Place } from "@/types/place";
import type { EssentialPOI } from "@/types/essentials";
import { getMapProvider } from "@/lib/providers/provider-registry";
import { formatEssentialCategoryLabel } from "@/lib/utils/format";
import { MarkerPopup } from "./MarkerPopup";

// Served from /public (copied from leaflet/dist/images) rather than
// imported from node_modules — confirmed via real browser testing that
// Turbopack's static-asset resolution for a third-party package's own
// PNGs doesn't reliably produce a working .src here, which threw
// "iconUrl not set in Icon options" on every marker and crashed the
// map. Plain, predictable string paths sidestep that entirely.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface MapViewProps {
  places: Place[];
  center: Coordinates;
  highlightPlaceId?: string;
  /** Live POI results (Nearby Essentials) — rendered as small filled
   * circles rather than the curated-place pin icon, so it's visually
   * obvious these come from a different, live data source. */
  essentials?: EssentialPOI[];
}

function HighlightEffect({
  highlightPlaceId,
  markersRef,
}: {
  highlightPlaceId: string;
  markersRef: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    const marker = markersRef.current.get(highlightPlaceId);
    if (!marker) return;
    map.flyTo(marker.getLatLng(), 15, { duration: 0.8 });
    marker.openPopup();
    // Runs once when the highlighted place changes — not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightPlaceId]);

  return null;
}

/**
 * Rendered inside Leaflet's own bottom-right control slot (the standard
 * `leaflet-bottom`/`leaflet-control` classes), so it's positioned and
 * layered by Leaflet itself — never collides with the default top-left
 * zoom control, and needs no custom z-index bookkeeping.
 */
function RecenterControl({ center }: { center: Coordinates }) {
  const map = useMap();

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          onClick={() => map.flyTo([center.lat, center.lng], 12, { duration: 0.6 })}
          aria-label="Recenter map"
          title="Recenter map"
          className="flex h-8 w-8 items-center justify-center bg-white text-base text-navy-900 transition-colors hover:bg-sandstone-100"
        >
          🎯
        </button>
      </div>
    </div>
  );
}

export function MapView({ places, center, highlightPlaceId, essentials }: MapViewProps) {
  const mapProvider = getMapProvider();
  const tileConfig = mapProvider.getTileConfig();
  const markers = mapProvider.toMarkers(places);
  const markersRef = useRef(new Map<string, L.Marker>());

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer url={tileConfig.url} attribution={tileConfig.attribution} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.coordinates.lat, marker.coordinates.lng]}
          ref={(instance) => {
            if (instance) markersRef.current.set(marker.id, instance);
            else markersRef.current.delete(marker.id);
          }}
        >
          <Popup>
            <MarkerPopup place={marker.place} />
          </Popup>
        </Marker>
      ))}
      {essentials?.map((poi) => (
        <CircleMarker
          key={poi.id}
          center={[poi.coordinates.lat, poi.coordinates.lng]}
          radius={7}
          pathOptions={{ color: "#1F497D", fillColor: "#1F497D", fillOpacity: 0.85, weight: 2 }}
        >
          <Popup>
            <p className="text-xs font-medium uppercase tracking-wide text-saffron-600">
              {formatEssentialCategoryLabel(poi.category)}
            </p>
            <p className="mt-1 font-display text-base text-navy-900">{poi.name}</p>
          </Popup>
        </CircleMarker>
      ))}
      {highlightPlaceId && (
        <HighlightEffect highlightPlaceId={highlightPlaceId} markersRef={markersRef} />
      )}
      <RecenterControl center={center} />
    </MapContainer>
  );
}
