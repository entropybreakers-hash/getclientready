import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  listStudents,
  listSubmissionsForAdmin,
} from "@/lib/data";
import { formatDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [students, pending] = await Promise.all([
    listStudents(),
    listSubmissionsForAdmin({ status: "pending_review" }),
  ]);

  const pendingByUser = new Map<string, number>();
  for (const s of pending) {
    pendingByUser.set(s.user_id, (pendingByUser.get(s.user_id) ?? 0) + 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10">
      {/* Header + feedback CTA */}
      <header>
        <div className="eyebrow mb-2">Admin</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          Overview
        </h1>
      </header>

      {/* Feedback queue card */}
      <Link
        href="/admin/submissions"
        className="block bg-bg-card border border-accent/30 rounded-sm p-6 md:p-8 hover:border-accent transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Feedback queue</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium leading-snug">
              {pending.length === 0
                ? "Inbox zero ✓"
                : `${pending.length} submission${pending.length === 1 ? "" : "s"} awaiting your feedback`}
            </h2>
            {pending.length > 0 && (
              <p className="mt-2 text-sm text-ink-muted">
                Oldest:{" "}
                <span className="text-ink-light">
                  {`${pending[0].student.first_name} ${pending[0].student.last_name}`.trim() ||
                    pending[0].student.email}
                </span>{" "}
                — {pending[0].exercise.title} ({relativeTime(pending[0].submitted_at)})
              </p>
            )}
          </div>
          <Badge variant={pending.length === 0 ? "success" : "warn"}>
            {pending.length === 0 ? "All clear" : "Open queue →"}
          </Badge>
        </div>
      </Link>

      {/* Students list */}
      <section>
        <h2 className="font-serif text-2xl md:text-3xl font-medium mb-5">
          Active students
        </h2>
        <div className="bg-bg-card border border-white/5 rounded-sm overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted border-b border-white/5">
            <div className="md:col-span-3">Student</div>
            <div className="md:col-span-2">Tier</div>
            <div className="md:col-span-3">Progress</div>
            <div className="md:col-span-2">Started</div>
            <div className="md:col-span-2 text-right">Pending</div>
          </div>
          {students.length === 0 ? (
            <div className="px-6 py-10 text-center text-ink-muted text-sm">
              No students yet. Create one in Supabase Auth → Users.
            </div>
          ) : (
            students.map((s) => {
              const count = pendingByUser.get(s.user_id) ?? 0;
              const pct = Math.round(((s.current_week - 1) / 6) * 100);
              return (
                <Link
                  key={s.user_id}
                  href={`/admin/students/${s.user_id}`}
                  className="md:grid md:grid-cols-12 gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors block"
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
                    {count > 0 ? (
                      <Badge variant="warn">{count} pending</Badge>
                    ) : (
                      <span className="text-xs text-ink-muted">All clear</span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <p className="text-xs text-ink-muted">
        Need to add a student?{" "}
        <a
          href="https://supabase.com/dashboard/project/zqjvwddbfedtnsqpjomk/auth/users"
          target="_blank"
          rel="noopener"
          className="text-accent hover:underline"
        >
          Open Supabase Auth →
        </a>
      </p>
    </div>
  );
}
