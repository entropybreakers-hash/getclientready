"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface TopNavProps {
  profile: Profile;
  welcome?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/modules", label: "Modules" },
  { href: "/playbook", label: "Playbook" },
];

export function TopNav({ profile, welcome }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const initial = (profile.first_name?.[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg-dark/85 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />
        {welcome && (
          <p className="hidden md:block text-sm text-ink-muted italic font-serif">
            {welcome}, <span className="text-ink-light not-italic">{profile.first_name}</span>
          </p>
        )}
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-xs tracking-[0.18em] uppercase text-ink-light/75 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-white/5 transition-colors"
              aria-label="Account menu"
            >
              <span className="w-9 h-9 rounded-full bg-accent text-bg-dark font-semibold flex items-center justify-center text-sm">
                {initial}
              </span>
            </button>

            <div
              className={cn(
                "absolute right-0 top-12 w-56 bg-bg-card border border-white/10 rounded-sm shadow-2xl p-2 transition-all",
                open
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none",
              )}
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <div className="text-sm font-medium text-ink-light">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="text-xs text-ink-muted truncate">
                  {profile.email}
                </div>
              </div>
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm hover:bg-white/5 rounded-sm"
              >
                Profile
              </Link>
              <Link
                href="/submissions"
                className="block px-3 py-2 text-sm hover:bg-white/5 rounded-sm md:hidden"
              >
                My submissions
              </Link>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm hover:bg-white/5 rounded-sm md:hidden"
                >
                  {item.label}
                </Link>
              ))}
              {profile.is_admin && (
                <Link
                  href="/admin"
                  className="block px-3 py-2 text-sm text-accent hover:bg-white/5 rounded-sm"
                >
                  Admin
                </Link>
              )}
              <form action="/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2 text-sm text-ink-muted hover:bg-white/5 hover:text-ink-light rounded-sm"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
