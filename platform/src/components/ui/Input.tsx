import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-11 rounded-sm bg-bg-card border border-white/10 px-4 text-base text-ink-light placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full min-h-[160px] rounded-sm bg-bg-card border border-white/10 px-4 py-3 text-base text-ink-light placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-2",
        className,
      )}
      {...props}
    />
  );
}
