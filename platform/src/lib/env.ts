// Centralised env reads. Keeps the rest of the app from sprinkling
// `process.env.*` everywhere and surfaces missing-env failures early.

export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Single Bettina email for /admin gating in V1 (replaced by `is_admin` flag
// in profiles when she creates her account).
export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "baranyibettina@entropybreakers.com";

export const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";

export const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ??
  "https://getclientready.entropybreakers.com";

// Server-only — must NOT be NEXT_PUBLIC_ (would leak to client bundle).
// Only read inside server actions / server components.
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
