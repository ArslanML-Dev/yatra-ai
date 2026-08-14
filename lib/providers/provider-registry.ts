import { lucknowCuratedProvider } from "./lucknow-curated-provider";
import { leafletMapProvider } from "./leaflet-map-provider";
import { ruleBasedAIProvider } from "./rule-based-ai-provider";
import type { PlaceProvider } from "./place-provider";
import type { MapProvider } from "./map-provider";
import type { AIProvider } from "./ai-provider";

/**
 * Single place callers ask for a provider. Today every destinationId
 * resolves to the same Lucknow-curated data, but this is the seam where
 * a future multi-city app would branch by destinationId instead.
 */
export function getPlaceProvider(_destinationId: string): PlaceProvider {
  return lucknowCuratedProvider;
}

export function getMapProvider(): MapProvider {
  return leafletMapProvider;
}

export function getAIProvider(): AIProvider {
  return ruleBasedAIProvider;
}
