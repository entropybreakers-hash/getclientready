import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "outline" | "ghost";
type Size = "default" | "sm" | "lg";

const variants: Record<Variant, string> = {
  accent:
    "bg-accent text-bg-dark hover:bg-accent-deep shadow-[0_10px_30px_rgba(201,168,118,0.15)] hover:shadow-[0_14px_40px_rgba(201,168,118,0.25)]",
  outline:
    "border border-white/25 text-ink-light hover:border-accent hover:bg-accent/5",
  ghost: "text-ink-light hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  default: "h-11 px-7 text-xs",
  sm: "h-9 px-4 text-[0.65rem]",
  lg: "h-12 px-9 text-sm",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "accent", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
