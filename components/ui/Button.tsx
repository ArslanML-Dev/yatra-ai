import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "outline";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-saffron-600 text-ivory hover:bg-saffron-500 focus-visible:bg-saffron-500",
  // For use on dark/hero backgrounds.
  secondary:
    "bg-transparent text-ivory border border-ivory/40 hover:border-ivory hover:bg-ivory/10",
  ghost: "bg-transparent text-navy-900 hover:bg-sandstone-100",
  dark: "bg-navy-900 text-ivory hover:bg-navy-800",
  // For use on light backgrounds.
  outline: "bg-transparent text-navy-900 border border-navy-900/30 hover:bg-sandstone-100",
};

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200",
    variantClasses[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
