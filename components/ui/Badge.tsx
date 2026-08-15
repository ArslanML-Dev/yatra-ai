import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: ReactNode;
  tone?: "sandstone" | "navy" | "leaf" | "translucent";
  className?: string;
}

const toneClasses = {
  sandstone: "bg-sandstone-100 text-ink-soft",
  navy: "bg-navy-900 text-ivory",
  leaf: "bg-leaf-600/10 text-leaf-600",
  // For use over a photo/dark background, e.g. the place-page hero.
  translucent: "border border-ivory/25 bg-ivory/10 text-ivory backdrop-blur-sm",
};

export function Badge({ children, tone = "sandstone", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
