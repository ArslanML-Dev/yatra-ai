import type { Place } from "@/types/place";

export const parkPlaces: Place[] = [
  {
    id: "janeshwar-mishra-park",
    destinationId: "lucknow",
    name: "Janeshwar Mishra Park",
    category: "parks",
    subcategory: "urban-park",
    description:
      "A large landscaped park in Gomti Nagar with three artificial lakes, boating, and cycling and jogging tracks, developed by the Lucknow Development Authority.",
    whyVisit:
      "A wide-open green space for walking, cycling or boating — a change of pace from the old city.",
    historicalContext:
      "Not a heritage site — a modern park opened on 5 August 2014, named after Samajwadi Party politician Janeshwar Mishra, spanning 376 acres.",
    bestTime: "Early morning (cooler, joggers and yoga groups) or evening (families, sunset)",
    estimatedVisitMinutes: 90,
    suitableTimesOfDay: ["morning", "evening"],
    coordinates: { lat: 26.834899, lng: 80.988686 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Janeshwar_Mishra_Park.jpg",
        alt: "A lake and walking path in Janeshwar Mishra Park, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Janeshwar_Mishra_Park.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: [
      "Widely described as one of the largest urban parks in Asia",
      "Three artificial lakes with paddle and gondola boating",
    ],
    tags: ["parks", "anchor", "family-friendly"],
    nearbyIds: ["ambedkar-memorial-park", "gomti-riverfront-park"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Janeshwar_Mishra_Park",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
  {
    id: "ambedkar-memorial-park",
    destinationId: "lucknow",
    name: "Ambedkar Memorial Park",
    category: "parks",
    subcategory: "memorial-park",
    description:
      "A 108-acre red-sandstone memorial park in Gomti Nagar honouring Dr. B.R. Ambedkar, with monumental elephant statues, a central stupa and a museum.",
    whyVisit:
      "Monumental red-sandstone architecture and elephant statue avenues, striking at sunset.",
    historicalContext:
      "Foundation laid in 1995, designed by architect Hafeez Contractor and built under then-Chief Minister Mayawati; opened to the public on 14 April 2008, built entirely from Rajasthan red sandstone.",
    bestTime: "Late afternoon into evening, when the sandstone catches the light and the park is illuminated",
    estimatedVisitMinutes: 75,
    suitableTimesOfDay: ["evening", "night"],
    coordinates: { lat: 26.848882, lng: 80.977893 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg/1280px-Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg",
        alt: "Ambedkar Memorial Park illuminated at night, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: [
      "124 monumental red-sandstone elephant statues",
      "An 80-foot pyramid viewing structure and a two-domed museum",
    ],
    tags: ["parks", "family-friendly"],
    nearbyIds: ["janeshwar-mishra-park", "gomti-riverfront-park"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Ambedkar_Memorial_Park",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
];
