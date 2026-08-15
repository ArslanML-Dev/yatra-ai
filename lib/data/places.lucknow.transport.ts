import type { Place } from "@/types/place";

export const transportPlaces: Place[] = [
  {
    id: "ccs-international-airport",
    destinationId: "lucknow",
    name: "Chaudhary Charan Singh International Airport",
    category: "transport",
    subcategory: "airport",
    description:
      "Lucknow's international airport (IATA: LKO), located in Amausi, about 14 km from the city centre.",
    whyVisit: "The city's main air gateway — Terminal 3's frosted-glass façade incorporates Chikankari-inspired patterns.",
    historicalContext:
      "Named after former Prime Minister Chaudhary Charan Singh. Terminal 3 opened 10 March 2024, rated for over 13 million passengers a year; it is cited as the 11th-busiest airport in India by passenger traffic.",
    estimatedVisitMinutes: 0,
    suitableTimesOfDay: ["morning", "afternoon", "evening", "night"],
    coordinates: { lat: 26.76056, lng: 80.89028 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Terminal-2%2C_Lucknow_International_airport.jpg",
        alt: "Terminal 2 at Chaudhary Charan Singh International Airport, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Terminal-2,_Lucknow_International_airport.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: ["Terminal 3's Chikankari-inspired façade"],
    tags: ["transport"],
    nearbyIds: [],
    transportNote: "About 14 km from the city centre — plan for a 30–45 minute cab ride depending on traffic.",
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Chaudhary_Charan_Singh_International_Airport",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
  {
    id: "charbagh-railway-station",
    destinationId: "lucknow",
    name: "Charbagh Railway Station",
    category: "transport",
    subcategory: "railway-station",
    description:
      "Lucknow's principal and busiest railway station, opened in 1914, known for its Indo-Saracenic architecture blending Mughal, Awadhi and Rajput elements.",
    whyVisit: "A recognised architectural landmark in its own right, often called one of India's most beautiful railway stations.",
    historicalContext:
      "Building completed 1923, formally inaugurated 1926; designed by architect J. H. Horniman to visually echo the domes and minarets of Lucknow's Nawabi-era monuments.",
    bestTime: "Daytime, to see the façade detail clearly",
    estimatedVisitMinutes: 30,
    suitableTimesOfDay: ["morning", "afternoon"],
    coordinates: { lat: 26.832, lng: 80.919 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Charbagh_Railway_Station%2C_Lucknow.jpg",
        alt: "Charbagh Railway Station's Indo-Saracenic facade in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Charbagh_Railway_Station,_Lucknow.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: ["Indo-Saracenic architecture echoing Lucknow's Nawabi-era monuments"],
    tags: ["transport"],
    nearbyIds: ["chowk-chikankari-market", "aminabad-market"],
    transportNote: "Central and well-connected — a short auto or cab ride from both Old Lucknow and Hazratganj.",
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Lucknow_Charbagh_railway_station",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
];
