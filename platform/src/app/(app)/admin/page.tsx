import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCurrentProfile, getMySubmissions, listStudents } from "@/lib/data";
import { formatDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin && process.env.NEXT_PUBLIC_USE_MOCK !== "true") {
    notFound();
  }

  const students = await listStudents();
  // V1: surface the demo user's submissions as "pending" counts.
  const mySubs = await getMySubmissions();
  const pendingByUser = new Map<string, number>();
  for (const s of mySubs) {
    if (s.status === "pending_review") {
      pendingByUser.set(s.user_id, (pendingByUser.get(s.user_id) ?? 0) + 1);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <header className="mb-10">
        <div className="eyebrow mb-2">Admin</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          Active students
        </h1>
        <p className="mt-3 text-sm text-ink-muted max-w-2xl">
          V1 admin view. Full editing happens in the Supabase dashboard — this page is here so
          Bettina can see who needs feedback at a glance.
        </p>
      </header>

      <div className="bg-bg-card border border-white/5 rounded-sm overflow-hidden">
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted border-b border-white/5">
          <div className="md:col-span-3">Student</div>
          <div className="md:col-span-2">Tier</div>
          <div className="md:col-span-3">Progress</div>
          <div className="md:col-span-2">Started</div>
          <div className="md:col-span-2 text-right">Pending</div>
        </div>
        {students.map((s) => {
          const pending = pendingByUser.get(s.user_id) ?? 0;
          const pct = Math.round(((s.current_week - 1) / 6) * 100);
          return (
            <div
              key={s.user_id}
              className="md:grid md:grid-cols-12 gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
            >
              <div className="md:col-span-3 mb-3 md:mb-0">
                <div className="font-medium text-ink-light">
                  {s.first_name} {s.last_name}
                </div>
                <div className="text-xs text-ink-muted truncate">{s.email}</div>
              </div>
              <div className="md:col-span-2 mb-3 md:mb-0">
                <Badge variant="accent">
                  {s.tier.charAt(0).toUpperCase() + s.tier.slice(1)}
                </Badge>
              </div>
              <div className="md:col-span-3 mb-3 md:mb-0">
                <div className="text-[0.65rem] tracking-[0.18em] uppercase text-ink-muted mb-1">
                  Week {s.current_week} of 6
                </div>
                <ProgressBar value={pct} />
              </div>
              <div className="md:col-span-2 text-sm text-ink-muted mb-3 md:mb-0">
                {formatDate(s.started_at)}
                <div className="text-xs text-ink-muted/70 mt-0.5">
                  ({relativeTime(s.started_at)})
                </div>
              </div>
              <div className="md:col-span-2 md:text-right">
                {pending > 0 ? (
                  <Badge variant="warn">{pending} pending</Badge>
                ) : (
                  <span className="text-xs text-ink-muted">All clear</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        Pending = unresolved submissions waiting for your feedback. Click a student to view
        their work in V2.
      </p>
    </div>
  );
}
