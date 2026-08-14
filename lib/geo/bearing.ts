import type { Coordinates } from "@/types/place";

/** Great-circle initial bearing from `from` to `to`, in degrees (0-360,
 * 0 = north). Pure math — no external routing dependency. */
export function computeBearingDegrees(from: Coordinates, to: Coordinates): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
