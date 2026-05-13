// Browser-side Supabase client (anon key only).
// Used by Client Components for auth + read/write through RLS.

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, USE_MOCK } from "../env";

export function getBrowserClient() {
  if (USE_MOCK) {
    throw new Error(
      "Supabase browser client called while NEXT_PUBLIC_USE_MOCK=true. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use the real client.",
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
