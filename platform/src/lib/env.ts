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

// Platform URL used in admin-generated WhatsApp welcome messages.
export const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://app.entropybreakers.com";

// Server-only — must NOT be NEXT_PUBLIC_ (would leak to client bundle).
// Only read inside server actions / server components.
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

// Sender address for transactional email. Must be on a domain verified
// in Resend (https://resend.com/domains). Falls back to onboarding sandbox.
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Bettina @ Get Client Ready <bettina@entropybreakers.com>";

// Plausible Analytics domain. When unset, no analytics script is loaded
// (zero third-party requests). To activate: register the domain in the
// Plausible dashboard and set this env var to the same value.
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";

// Supabase service-role key — bypasses RLS. Used only by the Stripe
// webhook to provision new accounts. NEVER expose to the client.
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Stripe — server-only credentials for the checkout webhook.
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Map Stripe Price IDs to internal tier strings.
// Find each Price ID in Stripe Dashboard → Products → click product →
// Pricing section → copy "price_..." id (NOT the product id).
export const STRIPE_PRICE_TO_TIER: Record<string, "sprint" | "shift" | "reframe"> =
  Object.fromEntries(
    (
      [
        [process.env.STRIPE_PRICE_SPRINT?.trim(), "sprint"],
        [process.env.STRIPE_PRICE_SHIFT?.trim(), "shift"],
        [process.env.STRIPE_PRICE_REFRAME?.trim(), "reframe"],
      ] as const
    ).filter((pair): pair is [string, "sprint" | "shift" | "reframe"] =>
      Boolean(pair[0]),
    ),
  );
