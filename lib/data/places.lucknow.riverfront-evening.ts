import type { Place } from "@/types/place";

export const riverfrontEveningPlaces: Place[] = [
  {
    id: "gomti-riverfront-park",
    destinationId: "lucknow",
    name: "Gomti Riverfront Park",
    category: "riverfront_evening",
    subcategory: "riverfront",
    description:
      "A roughly 2 km riverfront promenade and park along the Gomti River, inaugurated in October 2016 as part of the Gomti riverfront redevelopment.",
    whyVisit: "An evening riverside walk, away from the density of the old city.",
    historicalContext: "Opened October 2016; commonly mentioned features include cycling/jogging tracks and an amphitheatre.",
    bestTime: "Evening — a musical fountain show is commonly mentioned around 7:30–9pm, though exact timing varies by source and should be confirmed locally",
    estimatedVisitMinutes: 60,
    suitableTimesOfDay: ["evening", "night"],
    area: "riverfront",
    coordinates: { lat: 26.8451102, lng: 80.9708927 },
    images: [],
    priceRange: "unknown",
    knownFor: ["A riverside promenade with a musical fountain and amphitheatre commonly mentioned in visitor guides"],
    tags: ["riverfront_evening", "parks"],
    nearbyIds: ["ambedkar-memorial-park", "janeshwar-mishra-park"],
    source: "openstreetmap",
    sourceUrl: "https://www.openstreetmap.org",
    retrievedAt: "2026-08-14",
    verificationStatus: "CURATED",
    dataType: "CURATED",
  },
];
