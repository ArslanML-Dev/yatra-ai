import type { MetadataRoute } from "next";
import { getPlaceProvider } from "@/lib/providers/provider-registry";

const SITE_URL = "https://yatra-ai-five.vercel.app";

const STATIC_ROUTES = [
  "",
  "/explore",
  "/explore/heritage",
  "/explore/food",
  "/explore/shopping",
  "/explore/parks",
  "/explore/riverfront_evening",
  "/explore/modern",
  "/explore/transport",
  "/map",
  "/transport",
  "/essentials",
  "/plan",
  "/saved",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getPlaceProvider("lucknow").getAllPlaces("lucknow");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const placeEntries: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${SITE_URL}/place/${place.id}`,
    lastModified: place.retrievedAt,
  }));

  return [...staticEntries, ...placeEntries];
}
