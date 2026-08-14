import type { Source } from "@/types/source";

export const sources: Source[] = [
  {
    id: "wikipedia",
    label: "Wikipedia",
    url: "https://en.wikipedia.org",
  },
  {
    id: "wikimedia-commons",
    label: "Wikimedia Commons",
    url: "https://commons.wikimedia.org",
  },
  {
    id: "openstreetmap",
    label: "OpenStreetMap",
    url: "https://www.openstreetmap.org",
  },
  {
    id: "up-tourism",
    label: "UP Tourism (Official)",
    url: "https://uptourism.gov.in",
  },
  {
    id: "team-research",
    label: "Team field research",
  },
];

export function getSource(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
