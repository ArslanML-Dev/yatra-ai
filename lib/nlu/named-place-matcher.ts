import type { Place } from "@/types/place";

/**
 * Hand-curated short-form aliases for the current (small, known) Lucknow
 * dataset. Deliberately conservative — no fuzzy/typo matching — so a
 * match is trustworthy enough to silently lock a place as an anchor.
 * Ambiguous bare words shared across multiple places (e.g. "chowk") are
 * intentionally omitted; only unambiguous fuller phrases are included.
 */
const ALIASES: Record<string, string[]> = {
  "bara-imambara": ["bara imambara", "imambara", "bhulbhulaiya"],
  "rumi-darwaza": ["rumi darwaza", "rumi gate"],
  "chhota-imambara": ["chhota imambara", "hussainabad imambara", "palace of lights"],
  "british-residency": ["the residency", "residency", "british residency"],
  "tunday-kababi": ["tunday kababi", "tunday", "tunde kababi", "galouti kebab"],
  "raheems-nihari": ["raheem's", "raheems", "raheem nihari"],
  "royal-cafe-hazratganj": ["royal cafe", "royal café", "basket chaat"],
  "chowk-food-street": ["chowk food street", "chowk street food"],
  "janeshwar-mishra-park": ["janeshwar mishra park", "janeshwar mishra"],
  "ambedkar-memorial-park": ["ambedkar memorial park", "ambedkar park"],
  "chowk-chikankari-market": ["chowk chikankari market", "chowk market", "chikankari market"],
  "aminabad-market": ["aminabad market", "aminabad"],
  "hazratganj-market": ["hazratganj"],
  "lulu-mall-lucknow": ["lulu mall", "lulu"],
  "phoenix-palassio": ["phoenix palassio", "phoenix mall", "palassio"],
  "ekana-stadium": ["ekana cricket stadium", "ekana stadium", "ekana"],
  "gomti-riverfront-park": ["gomti riverfront", "gomti riverfront park", "riverfront park"],
  "ccs-international-airport": [
    "chaudhary charan singh international airport",
    "lucknow airport",
    "ccs airport",
    "airport",
  ],
  "charbagh-railway-station": ["charbagh railway station", "charbagh station", "charbagh"],
};

function buildAliasesForPlace(place: Place): string[] {
  const curated = ALIASES[place.id] ?? [];
  return Array.from(new Set([place.name.toLowerCase(), ...curated]));
}

/** Matches free text against known place names/aliases. Word-boundary
 * substring matching only — no fuzzy tolerance — to avoid false
 * positives that would silently lock the wrong place. */
export function matchNamedPlaces(text: string, places: Place[]): Place[] {
  const lower = text.toLowerCase();
  const matches: Place[] = [];

  for (const place of places) {
    const aliases = buildAliasesForPlace(place);
    const hit = aliases.some((alias) => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(` ${lower} `);
    });
    if (hit) matches.push(place);
  }

  return matches;
}
