import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/env";

// Exchanges the one-time code from a Supabase email link (password
// recovery) for a session, sets the auth cookies, then forwards the
// user to the in-app page named in `next`.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Only allow same-site relative paths in `next` — guards against an
  // open redirect via a crafted link.
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code && !USE_MOCK) {
    const { getServerClient } = await import("@/lib/supabase/server");
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL("/forgot-password?error=link", request.url),
      );
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
