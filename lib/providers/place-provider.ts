import type { Destination } from "@/types/destination";
import type { Place, PlaceCategory } from "@/types/place";

/**
 * Data-access seam for tourism content. The current implementation
 * (LucknowCuratedProvider) reads from in-memory TS data, but every method
 * is async so a future database-backed provider can replace it without
 * touching any caller.
 */
export interface PlaceProvider {
  getDestination(destinationId: string): Promise<Destination | null>;
  getAllPlaces(destinationId: string): Promise<Place[]>;
  getPlacesByCategory(destinationId: string, category: PlaceCategory): Promise<Place[]>;
  getPlaceById(id: string): Promise<Place | null>;
  getNearby(placeId: string): Promise<Place[]>;
}
