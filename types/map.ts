import type { Coordinates, Place, PlaceCategory } from "./place";

export interface MapMarker {
  id: string;
  place: Place;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
}

export type CategoryFilter = PlaceCategory | "all";
