import type { Destination } from "@/types/destination";

export const destinations: Destination[] = [
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
    center: { lat: 26.8467, lng: 80.9462 },
    heroImages: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bara_Imambara_Lucknow.jpg",
        alt: "Bara Imambara, a grand Nawabi-era hall and mosque complex in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Bara_Imambara_Lucknow.jpg",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rumi_Darwaza_-_DSC2797-01.jpg/1280px-Rumi_Darwaza_-_DSC2797-01.jpg",
        alt: "Rumi Darwaza, an 18-metre Awadhi-style gateway in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Rumi_Darwaza_-_DSC2797-01.jpg",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg/1280px-Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg",
        alt: "Ambedkar Memorial Park illuminated at night, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Night_View_of_the_Ambedkar_Memorial_at_Lucknow.jpg",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Chhota_imambara_Lucknow.jpg",
        alt: "Chhota Imambara's gilded dome and courtyard in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Chhota_imambara_Lucknow.jpg",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Janeshwar_Mishra_Park.jpg",
        alt: "A lake and walking path in Janeshwar Mishra Park, Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Janeshwar_Mishra_Park.jpg",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Charbagh_Railway_Station%2C_Lucknow.jpg",
        alt: "Charbagh Railway Station's Indo-Saracenic facade in Lucknow",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Charbagh_Railway_Station,_Lucknow.jpg",
      },
    ],
    shortOverview:
      "Lucknow pairs Nawabi-era heritage — imambaras, gateways, and the tehzeeb that grew up around them — with a fast-growing modern city along the Gomti river. Awadhi cuisine, chikankari embroidery, and a genuinely walkable old quarter make it a rare mix of history and everyday life.",
    themes: ["heritage", "awadhi-cuisine", "chikankari", "gomti-riverfront", "modern-lucknow"],
  },
];

export function getDestination(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}
