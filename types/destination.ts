import type { Coordinates, ImageRef } from "./place";

export interface Destination {
  id: string;
  name: string;
  state: string;
  country: string;
  center: Coordinates;
  heroImages: ImageRef[];
  shortOverview: string;
  themes: string[];
}
