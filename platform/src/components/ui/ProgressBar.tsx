import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 bg-white/10 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-accent transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
