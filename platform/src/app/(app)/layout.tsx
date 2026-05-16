import { redirect } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { getCurrentProfile } from "@/lib/data";

function welcomeFor(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-full flex flex-col">
      <TopNav profile={profile} welcome={welcomeFor()} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-muted">
          <div>&copy; 2026 Entropy Breakers · Get Client Ready</div>
          <div className="flex gap-4">
            <a
              href="https://getclientready.entropybreakers.com/datenschutz.html"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              Datenschutz
            </a>
            <a
              href="https://getclientready.entropybreakers.com/impressum.html"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              Impressum
            </a>
            <a
              href="https://getclientready.entropybreakers.com/agb.html"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              AGB
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
