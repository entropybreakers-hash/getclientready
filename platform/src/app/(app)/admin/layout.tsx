import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";
import { USE_MOCK } from "@/lib/env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!USE_MOCK) {
    const profile = await getCurrentProfile();
    if (!profile?.is_admin) notFound();
  }
  return <>{children}</>;
}
