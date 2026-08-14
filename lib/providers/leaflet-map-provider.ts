import type { Coordinates, Place } from "@/types/place";
import type { MapProvider, TileConfig } from "./map-provider";

const LUCKNOW_CENTER: Coordinates = { lat: 26.8467, lng: 80.9462 };

export class LeafletMapProvider implements MapProvider {
  getTileConfig(): TileConfig {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  }

  getDefaultCenter(destinationId: string): Coordinates {
    if (destinationId === "lucknow") return LUCKNOW_CENTER;
    return LUCKNOW_CENTER;
  }

  toMarkers(places: Place[]) {
    return places.map((place) => ({
      id: place.id,
      coordinates: place.coordinates,
      place,
    }));
  }
}

export const leafletMapProvider = new LeafletMapProvider();
