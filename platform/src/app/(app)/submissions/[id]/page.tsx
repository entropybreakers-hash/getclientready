import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import { getSubmissionById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSubmissionById(id);
  if (!s) notFound();

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-6">
        <Link href="/submissions" className="hover:text-accent">
          Submissions
        </Link>{" "}
        / Week {s.exercise.week_number} · Exercise {s.exercise.order}
      </nav>

      <header className="mb-10">
        <div className="eyebrow mb-2">
          Week {s.exercise.week_number} · {s.exercise.title}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
          Your submission &amp; feedback
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Submitted {formatDate(s.submitted_at)}
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Submission */}
        <article className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="eyebrow">Your submission</h2>
            {s.status === "pending_review" && (
              <Link
                href={`/exercises/${s.exercise_id}`}
                className="text-xs tracking-[0.18em] uppercase text-accent hover:underline"
              >
                Edit &amp; resubmit →
              </Link>
            )}
          </div>
          {s.audio_url ? (
            <div className="space-y-3">
              <Badge variant="accent">Audio submission</Badge>
              <p className="text-sm text-ink-muted leading-relaxed">
                {s.content}
              </p>
              <audio controls src={s.audio_url} className="w-full" />
            </div>
          ) : (
            <p className="text-base text-ink-light/90 whitespace-pre-wrap leading-relaxed">
              {s.content}
            </p>
          )}
        </article>

        {/* Feedback */}
        <article className="bg-bg-card border border-accent/20 rounded-sm p-7 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="eyebrow">Feedback from Bettina</h2>
              <p className="text-xs text-ink-muted mt-1">
                {s.feedback
                  ? formatDate(s.feedback.created_at)
                  : "Pending"}
              </p>
            </div>
            <Badge
              variant={s.feedback ? "success" : "accent"}
            >
              {s.feedback ? "Ready ✓" : "Pending"}
            </Badge>
          </div>

          {s.feedback ? (
            <>
              <Markdown>{s.feedback.content}</Markdown>
              {s.feedback.patterns_identified.length > 0 && (
                <div className="mt-7 pt-6 border-t border-white/5">
                  <h3 className="eyebrow mb-3">Patterns identified</h3>
                  <div className="flex flex-wrap gap-2">
                    {s.feedback.patterns_identified.map((p) => (
                      <Badge key={p} variant="accent">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-base text-ink-muted font-serif italic leading-snug">
                Your submission is being analysed.
                <br />
                Feedback typically arrives within 24 hours.
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
