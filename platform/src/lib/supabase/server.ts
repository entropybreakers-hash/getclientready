// Server-side Supabase client.
// Used by Server Components, Server Actions and Route Handlers.
// Reads + refreshes the auth session from cookies.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, USE_MOCK } from "../env";

export async function getServerClient() {
  if (USE_MOCK) {
    throw new Error(
      "Supabase server client called while NEXT_PUBLIC_USE_MOCK=true.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        toSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookies() is read-only there.
          // The middleware will refresh the session; ignore here.
        }
      },
    },
  });
}
