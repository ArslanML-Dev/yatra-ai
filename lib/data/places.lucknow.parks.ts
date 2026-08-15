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
    area: "gomti-nagar-modern",
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
    area: "gomti-nagar-modern",
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
  {
    id: "begum-hazrat-mahal-park",
    destinationId: "lucknow",
    name: "Begum Hazrat Mahal Park",
    category: "parks",
    subcategory: "memorial-park",
    description:
      "A central Qaiserbagh park and memorial to Begum Hazrat Mahal, who led resistance from this area during the 1857 uprising — originally laid out under British rule as Victoria Park.",
    whyVisit: "A green, walkable central-Lucknow memorial space right next to the Qaiserbagh/Residency heritage cluster.",
    historicalContext:
      "Laid out in 1867 as Victoria Park to commemorate Queen Victoria, and renamed Begum Hazrat Mahal Park on Independence Day, 15 August 1962, honouring the Begum's role in the 1857 uprising against East India Company rule from this Qaiserbagh locality.",
    bestTime: "Morning or early evening for a quieter walk",
    estimatedVisitMinutes: 40,
    suitableTimesOfDay: ["morning", "evening"],
    area: "old-lucknow",
    coordinates: { lat: 26.8557493, lng: 80.9343728 },
    address: "Qaiserbagh, Lucknow 226001",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Begum_Hazrat_Mahal_Park_Lucknow.jpg",
        alt: "Begum Hazrat Mahal Park memorial, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Begum_Hazrat_Mahal_Park_Lucknow.jpg",
        license: "CC BY-SA 3.0",
      },
    ],
    priceRange: "free",
    knownFor: ["Central memorial to Begum Hazrat Mahal's role in the 1857 uprising"],
    tags: ["parks", "history"],
    nearbyIds: ["qaiserbagh", "british-residency"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Begum_Hazrat_Mahal",
    retrievedAt: "2026-08-15",
    verificationStatus: "CURATED",
    dataType: "CURATED",
  },
];
