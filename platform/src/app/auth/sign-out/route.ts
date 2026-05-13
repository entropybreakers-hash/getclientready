import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/env";

export async function POST(request: Request) {
  if (!USE_MOCK) {
    const { getServerClient } = await import("@/lib/supabase/server");
    const supabase = await getServerClient();
    await supabase.auth.signOut();
  }
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
