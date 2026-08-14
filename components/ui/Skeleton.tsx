import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-sandstone-100", className)}
      aria-hidden="true"
    />
  );
}
