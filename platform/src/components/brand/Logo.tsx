import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/dashboard", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-serif tracking-[0.18em] uppercase font-semibold text-base md:text-lg text-ink-light hover:opacity-90 transition-opacity",
        className,
      )}
    >
      Get <em className="accent-text font-medium">Client</em> Ready
    </Link>
  );
}
