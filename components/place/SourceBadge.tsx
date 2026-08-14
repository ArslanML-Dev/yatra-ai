import { Badge } from "@/components/ui/Badge";
import type { VerificationStatus } from "@/types/source";

const labels: Record<VerificationStatus, string> = {
  VERIFIED_STATIC: "Verified",
  CURATED: "Curated",
  ESTIMATED: "Estimated",
};

const tones: Record<VerificationStatus, "leaf" | "sandstone" | "navy"> = {
  VERIFIED_STATIC: "leaf",
  CURATED: "sandstone",
  ESTIMATED: "sandstone",
};

export function SourceBadge({ status }: { status: VerificationStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
