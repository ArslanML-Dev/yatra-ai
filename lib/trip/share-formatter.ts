import type { Itinerary } from "@/types/itinerary";
import type { Place } from "@/types/place";

const TIME_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

/** Renders the CURRENT (possibly edited) itinerary as human-readable
 * text — never JSON — for Web Share / clipboard / WhatsApp. */
export function formatTripAsText(itinerary: Itinerary, placesById: Map<string, Place>): string {
  const lines: string[] = [];
  lines.push("YATRA AI");
  lines.push(`${itinerary.days.length}-Day Lucknow Trip`);
  lines.push("");

  for (const day of itinerary.days) {
    lines.push(`DAY ${day.dayNumber}${day.theme ? ` — ${day.theme.toUpperCase()}` : ""}`);
    if (day.slots.length === 0) {
      lines.push("  A lighter day — revisit a favourite spot at your own pace.");
    }
    for (const slot of day.slots) {
      const place = placesById.get(slot.placeId);
      if (!place) continue;
      const lock = slot.locked ? " 🔒" : "";
      lines.push(`  ${TIME_LABELS[slot.timeOfDay] ?? slot.timeOfDay}: ${place.name}${lock}`);
    }
    lines.push("");
  }

  lines.push(itinerary.disclaimer);
  lines.push("");
  lines.push("Planned with Yatra AI — yatra-ai-five.vercel.app");

  return lines.join("\n");
}
