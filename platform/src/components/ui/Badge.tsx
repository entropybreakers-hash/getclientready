import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "success" | "warn";

const variants: Record<Variant, string> = {
  default: "bg-white/5 text-ink-muted border border-white/10",
  accent: "bg-accent/15 text-accent border border-accent/30",
  success: "bg-success/15 text-success border border-success/30",
  warn: "bg-warn/15 text-warn border border-warn/30",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.65rem] tracking-[0.18em] uppercase font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
