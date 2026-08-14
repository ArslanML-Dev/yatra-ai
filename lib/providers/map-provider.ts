import type { Coordinates, Place } from "@/types/place";

export interface TileConfig {
  url: string;
  attribution: string;
}

/**
 * Seam over the mapping library. The concrete implementation
 * (components/map/MapView.tsx, backed by react-leaflet/OpenStreetMap)
 * renders through React rather than an imperative handle, but every
 * value it needs — tile source, marker data, default viewport — is
 * produced by a MapProvider so swapping to Mapbox/Google Maps later
 * only means writing a new provider and a new MapView, not touching
 * any page that consumes markers.
 */
export interface MapProvider {
  getTileConfig(): TileConfig;
  getDefaultCenter(destinationId: string): Coordinates;
  toMarkers(places: Place[]): { id: string; coordinates: Coordinates; place: Place }[];
}
