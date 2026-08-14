import type { Place } from "@/types/place";

export const heritagePlaces: Place[] = [
  {
    id: "bara-imambara",
    destinationId: "lucknow",
    name: "Bara Imambara",
    category: "heritage",
    subcategory: "imambara",
    description:
      "A vast Nawabi-era congregation hall and mosque complex in Old Lucknow, built in Mughal style without iron or external support beams.",
    whyVisit:
      "Walk through one of Lucknow's grandest Nawabi-era halls and get genuinely lost in the Bhulbhulaiya labyrinth above it.",
    historicalContext:
      "Commissioned by Nawab Asaf-ud-Daula of Awadh and built between 1780 and 1784. The central hall spans roughly 50 by 16 metres with no supporting beams — the Bhulbhulaiya labyrinth of interconnecting passages above it developed partly as a structural solution to distribute the roof's weight.",
    bestTime: "Early morning or late afternoon, especially in the cooler months (Oct–Feb)",
    estimatedVisitMinutes: 150,
    suitableTimesOfDay: ["morning", "afternoon"],
    coordinates: { lat: 26.86917, lng: 80.91278 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bara_Imambara_Lucknow.jpg",
        alt: "Bara Imambara, a grand Nawabi-era hall and mosque complex in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Bara_Imambara_Lucknow.jpg",
        license: "GFDL 1.2",
      },
    ],
    priceRange: "unknown",
    knownFor: [
      "The Bhulbhulaiya labyrinth — widely described as one of the few genuine maze structures of its kind in India",
      "Widely described as one of the largest arched halls of its kind, built without external support",
    ],
    tags: ["heritage", "anchor", "family-friendly"],
    nearbyIds: [
      "rumi-darwaza",
      "chhota-imambara",
      "tunday-kababi",
      "raheems-nihari",
      "chowk-food-street",
      "chowk-chikankari-market",
    ],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Bara_Imambara",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
  {
    id: "rumi-darwaza",
    destinationId: "lucknow",
    name: "Rumi Darwaza",
    category: "heritage",
    subcategory: "gateway",
    description:
      "An 18-metre Awadhi-style gateway of brick and lime mortar, modeled on Istanbul's Sublime Porte, historically marking the entrance to Old Lucknow.",
    whyVisit:
      "See the gateway that has come to symbolize Lucknow, especially striking when lit in the evening.",
    historicalContext:
      "Built in 1784 under Nawab Asaf-ud-Daula, in the same building programme as Bara Imambara, and modeled after the Sublime Porte gateway in Istanbul.",
    bestTime: "Evening, when the gateway is lit — often paired with a Bara/Chhota Imambara visit",
    estimatedVisitMinutes: 20,
    suitableTimesOfDay: ["morning", "afternoon", "evening"],
    coordinates: { lat: 26.860556, lng: 80.915833 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rumi_Darwaza_-_DSC2797-01.jpg/1280px-Rumi_Darwaza_-_DSC2797-01.jpg",
        alt: "Rumi Darwaza, an 18-metre Awadhi-style gateway in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Rumi_Darwaza_-_DSC2797-01.jpg",
      },
    ],
    priceRange: "free",
    knownFor: ["Its scale and Istanbul-inspired design, sitting between Bara and Chhota Imambara"],
    tags: ["heritage", "anchor"],
    nearbyIds: ["bara-imambara", "chhota-imambara"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Rumi_Darwaza",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
  {
    id: "chhota-imambara",
    destinationId: "lucknow",
    name: "Chhota Imambara",
    category: "heritage",
    subcategory: "imambara",
    description:
      "A gilded-domed congregation hall and mausoleum known for its Belgian chandeliers and mirror-work interior, built as a smaller counterpart to Bara Imambara.",
    whyVisit:
      "Step into the 'Palace of Lights' — chandeliers, mirror-work and a gilded dome in one compact complex, plus a Taj Mahal replica on the grounds.",
    historicalContext:
      "Commissioned in 1838 by Muhammad Ali Shah, Nawab of Awadh, as a congregation hall and mausoleum for himself and his mother; the full complex took around 54 years to complete.",
    bestTime: "Late afternoon into early evening, when the chandelier-lit interior is most striking",
    estimatedVisitMinutes: 50,
    suitableTimesOfDay: ["afternoon", "evening"],
    coordinates: { lat: 26.873784, lng: 80.904409 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Chhota_imambara_Lucknow.jpg",
        alt: "Chhota Imambara's gilded dome and courtyard in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Chhota_imambara_Lucknow.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: ["Nicknamed the 'Palace of Lights' for its Belgian chandeliers and gilded dome"],
    tags: ["heritage", "anchor", "family-friendly"],
    nearbyIds: ["bara-imambara", "rumi-darwaza"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Chota_Imambara",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
  {
    id: "british-residency",
    destinationId: "lucknow",
    name: "The Residency",
    category: "heritage",
    subcategory: "ruins",
    description:
      "A ruined 18th-century residence-and-fortification complex, preserved since the 1857 Siege of Lucknow as a protected memorial with a museum and cemetery.",
    whyVisit: "Walk through cannon-scarred ruins that tell the story of the 1857 siege first-hand.",
    historicalContext:
      "Built between 1780 and 1800 as the residence of the British Resident to the Nawab's court. Besieged from July to November 1857 during the uprising against East India Company rule; the ruins, including a cemetery of roughly 2,000 graves, have been preserved largely as they were left.",
    bestTime: "Cooler months (Oct–Feb); some sources report an evening sound-and-light show — confirm timing locally",
    estimatedVisitMinutes: 75,
    suitableTimesOfDay: ["morning", "afternoon"],
    coordinates: { lat: 26.8618, lng: 80.9257 },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Office_-_The_Residency_-_Lucknow_-_India.jpg/1280px-Office_-_The_Residency_-_Lucknow_-_India.jpg",
        alt: "Ruined buildings at The Residency, Lucknow, site of the 1857 siege",
        source: "Wikimedia Commons",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Office_-_The_Residency_-_Lucknow_-_India.jpg",
      },
    ],
    priceRange: "unknown",
    knownFor: ["Cannon-scarred ruined walls from the 1857 siege"],
    tags: ["heritage", "history"],
    nearbyIds: ["chowk-food-street"],
    source: "wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/The_Residency,_Lucknow",
    retrievedAt: "2026-08-14",
    verificationStatus: "VERIFIED_STATIC",
    dataType: "VERIFIED_STATIC",
  },
];
