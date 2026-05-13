import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getAdminSubmissionById } from "@/lib/data";
import { formatDate, relativeTime } from "@/lib/utils";
import { FeedbackEditor } from "./FeedbackEditor";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getAdminSubmissionById(id);
  if (!s) notFound();

  const studentName =
    `${s.student.first_name ?? ""} ${s.student.last_name ?? ""}`.trim() ||
    s.student.email;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-6">
        <Link href="/admin" className="hover:text-accent">
          Admin
        </Link>{" "}
        /{" "}
        <Link href="/admin/submissions" className="hover:text-accent">
          Submissions
        </Link>{" "}
        / Week {s.exercise.week_number} · {s.exercise.title}
      </nav>

      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">
            {studentName} · {s.student.email}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
            {s.exercise.title}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Week {s.exercise.week_number} · {s.module_title} · Submitted{" "}
            {formatDate(s.submitted_at)} ({relativeTime(s.submitted_at)})
          </p>
        </div>
        <Badge variant={s.status === "feedback_ready" ? "success" : "warn"}>
          {s.status === "feedback_ready" ? "Feedback sent" : "Awaiting feedback"}
        </Badge>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left: student submission + prompt */}
        <div className="space-y-5">
          <article className="bg-bg-card border border-white/5 rounded-sm p-6 md:p-7">
            <h2 className="eyebrow mb-3">The prompt</h2>
            <p className="text-sm text-ink-light/80 leading-relaxed whitespace-pre-wrap">
              {s.exercise.prompt}
            </p>
          </article>

          <article className="bg-bg-card border border-white/5 rounded-sm p-6 md:p-7">
            <h2 className="eyebrow mb-3">Their submission</h2>
            {s.audio_url ? (
              <div className="space-y-3">
                <Badge variant="accent">Audio</Badge>
                <audio controls src={s.audio_url} className="w-full" />
                {s.content && (
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {s.content}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base text-ink-light/90 whitespace-pre-wrap leading-relaxed">
                {s.content}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-ink-muted">
              {s.content.length} characters · {s.content.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </article>
        </div>

        {/* Right: feedback editor */}
        <div className="lg:sticky lg:top-20">
          <article className="bg-bg-card border border-accent/20 rounded-sm p-6 md:p-7">
            <h2 className="eyebrow mb-4">Your feedback</h2>
            <FeedbackEditor
              submissionId={s.id}
              initialContent={s.feedback?.content ?? ""}
              initialPatterns={s.feedback?.patterns_identified ?? []}
              hasFeedback={!!s.feedback}
            />
          </article>
        </div>
      </div>
    </div>
  );
}
