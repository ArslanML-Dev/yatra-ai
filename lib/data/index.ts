import type { Place } from "@/types/place";
import { heritagePlaces } from "./places.lucknow.heritage";
import { foodPlaces } from "./places.lucknow.food";
import { shoppingPlaces } from "./places.lucknow.shopping";
import { parkPlaces } from "./places.lucknow.parks";
import { modernPlaces } from "./places.lucknow.modern";
import { transportPlaces } from "./places.lucknow.transport";
import { riverfrontEveningPlaces } from "./places.lucknow.riverfront-evening";

export const allLucknowPlaces: Place[] = [
  ...heritagePlaces,
  ...foodPlaces,
  ...shoppingPlaces,
  ...parkPlaces,
  ...modernPlaces,
  ...transportPlaces,
  ...riverfrontEveningPlaces,
];

export function getPlacesForDestination(destinationId: string): Place[] {
  if (destinationId === "lucknow") return allLucknowPlaces;
  return [];
}
