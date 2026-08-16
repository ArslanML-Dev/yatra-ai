export function formatDistanceKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Formats a distance with an explicit, labeled source — never a bare
 * number. "450 m from Bara Imambara" / "2.3 km from your location".
 */
export function formatDistanceWithSource(km: number, sourceLabel: string): string {
  return `${formatDistanceKm(km)} from ${sourceLabel}`;
}
