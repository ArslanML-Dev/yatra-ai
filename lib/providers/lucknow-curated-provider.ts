import type { Destination } from "@/types/destination";
import type { Place, PlaceCategory } from "@/types/place";
import { getDestination } from "@/lib/data/destinations";
import { getPlacesForDestination } from "@/lib/data";
import type { PlaceProvider } from "./place-provider";

export class LucknowCuratedProvider implements PlaceProvider {
  async getDestination(destinationId: string): Promise<Destination | null> {
    return getDestination(destinationId) ?? null;
  }

  async getAllPlaces(destinationId: string): Promise<Place[]> {
    return getPlacesForDestination(destinationId);
  }

  async getPlacesByCategory(destinationId: string, category: PlaceCategory): Promise<Place[]> {
    const places = await this.getAllPlaces(destinationId);
    return places.filter((p) => p.category === category);
  }

  async getPlaceById(id: string): Promise<Place | null> {
    const places = await this.getAllPlaces("lucknow");
    return places.find((p) => p.id === id) ?? null;
  }

  async getNearby(placeId: string): Promise<Place[]> {
    const places = await this.getAllPlaces("lucknow");
    const place = places.find((p) => p.id === placeId);
    if (!place) return [];
    return place.nearbyIds
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => Boolean(p));
  }
}

export const lucknowCuratedProvider = new LucknowCuratedProvider();
