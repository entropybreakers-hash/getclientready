import { redirect } from "next/navigation";
import { USE_MOCK } from "@/lib/env";

export default async function Index() {
  if (USE_MOCK) {
    redirect("/login");
  }
  // Live mode: server-side check happens in (app)/layout; just bounce to login.
  redirect("/login");
}
