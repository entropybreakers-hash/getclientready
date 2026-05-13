import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { listSubmissionsForAdmin } from "@/lib/data";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter =
    params.status === "feedback_ready"
      ? "feedback_ready"
      : params.status === "all"
        ? "all"
        : "pending_review";

  const submissions = await listSubmissionsForAdmin({ status: statusFilter });

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <header className="mb-8">
        <div className="eyebrow mb-2">Admin · Feedback queue</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          {statusFilter === "pending_review"
            ? "Pending feedback"
            : statusFilter === "feedback_ready"
              ? "Recently sent"
              : "All submissions"}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {statusFilter === "pending_review"
            ? "Oldest first. Click a row to write feedback."
            : statusFilter === "feedback_ready"
              ? "Submissions that already have feedback. Click to edit."
              : "Everything, regardless of status."}
        </p>
      </header>

      <div className="flex gap-2 mb-6 text-xs tracking-[0.18em] uppercase">
        <FilterPill href="/admin/submissions" active={statusFilter === "pending_review"}>
          Pending
        </FilterPill>
        <FilterPill
          href="/admin/submissions?status=feedback_ready"
          active={statusFilter === "feedback_ready"}
        >
          Sent
        </FilterPill>
        <FilterPill
          href="/admin/submissions?status=all"
          active={statusFilter === "all"}
        >
          All
        </FilterPill>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-bg-card border border-white/5 rounded-sm p-10 text-center">
          <p className="font-serif text-2xl italic text-ink-light/80">
            {statusFilter === "pending_review"
              ? "Inbox zero. Nothing to review right now."
              : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="bg-bg-card border border-white/5 rounded-sm overflow-hidden">
          {submissions.map((s) => {
            const studentName = `${s.student.first_name ?? ""} ${s.student.last_name ?? ""}`.trim() || s.student.email;
            return (
              <Link
                key={s.id}
                href={`/admin/submissions/${s.id}`}
                className="block px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-1">
                      Week {s.exercise.week_number} · {s.module_title} · {studentName}
                    </div>
                    <h3 className="font-serif text-lg md:text-xl font-medium leading-snug text-ink-light">
                      {s.exercise.title}
                    </h3>
                  </div>
                  <Badge
                    variant={s.status === "feedback_ready" ? "success" : "warn"}
                  >
                    {s.status === "feedback_ready" ? "Sent" : "Awaiting"}
                  </Badge>
                </div>
                <p className="text-sm text-ink-light/65 line-clamp-2 leading-relaxed">
                  {s.audio_url ? "[Audio submission]" : s.content}
                </p>
                <div className="mt-3 text-xs text-ink-muted">
                  Submitted {relativeTime(s.submitted_at)}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-ink-muted">
        <Link href="/admin" className="hover:text-accent">
          ← Back to admin overview
        </Link>
      </p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "px-3 py-1.5 bg-accent text-bg-dark rounded-sm font-medium"
          : "px-3 py-1.5 border border-white/10 text-ink-muted hover:border-accent hover:text-accent transition-colors rounded-sm"
      }
    >
      {children}
    </Link>
  );
}
