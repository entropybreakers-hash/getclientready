import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getMySubmissions } from "@/lib/data";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const subs = await getMySubmissions();
  const sorted = [...subs].sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <header className="mb-10">
        <div className="eyebrow mb-2">Your work</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          Submissions &amp; feedback
        </h1>
      </header>

      {sorted.length === 0 ? (
        <p className="text-ink-muted">
          You haven&apos;t submitted any exercises yet.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <Link
              key={s.id}
              href={`/submissions/${s.id}`}
              className="block bg-bg-card border border-white/5 rounded-sm p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted">
                  Week {s.exercise.week_number} · Exercise {s.exercise.order}
                </div>
                <Badge
                  variant={s.status === "feedback_ready" ? "success" : "accent"}
                >
                  {s.status === "feedback_ready"
                    ? "Feedback ready ✓"
                    : "Awaiting feedback"}
                </Badge>
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-medium mb-2 leading-snug">
                {s.exercise.title}
              </h2>
              <p className="text-sm text-ink-light/70 line-clamp-2 leading-relaxed">
                {s.audio_url ? "[Audio submission]" : s.content}
              </p>
              <div className="mt-3 text-xs text-ink-muted">
                Submitted {relativeTime(s.submitted_at)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
