import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import {
  getExerciseById,
  getModuleBySlug,
  getMySubmissionsForExercise,
} from "@/lib/data";
import { relativeTime } from "@/lib/utils";
import { SubmissionForm } from "./SubmissionForm";

export const dynamic = "force-dynamic";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExerciseById(id);
  if (!exercise) notFound();
  const mod = await getModuleBySlug(exercise.module_slug);
  const submissions = await getMySubmissionsForExercise(exercise.id);
  const latest = submissions[submissions.length - 1] ?? null;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-6">
        <Link href="/modules" className="hover:text-accent">
          Modules
        </Link>{" "}
        /{" "}
        <Link
          href={`/modules/${exercise.module_slug}`}
          className="hover:text-accent"
        >
          Week {exercise.week_number}
        </Link>{" "}
        / Exercise {exercise.order}
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="eyebrow">
            Week {exercise.week_number} · {mod?.title}
          </div>
          <Badge variant="default">{exercise.type}</Badge>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight">
          {exercise.title}
        </h1>
      </header>

      <section className="mb-10">
        <h2 className="eyebrow mb-3">The prompt</h2>
        <Markdown>{exercise.prompt}</Markdown>
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Your response</h2>
        <SubmissionForm
          exerciseId={exercise.id}
          exerciseType={exercise.type}
          existing={latest}
        />
      </section>

      {submissions.length > 0 && (
        <section className="pt-8 border-t border-white/5">
          <h2 className="font-serif text-xl md:text-2xl font-medium mb-5">
            Previous submissions
          </h2>
          <div className="space-y-3">
            {submissions.map((s) => (
              <Link
                key={s.id}
                href={`/submissions/${s.id}`}
                className="block bg-bg-card border border-white/5 rounded-sm p-5 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="text-xs text-ink-muted">
                    {relativeTime(s.submitted_at)}
                  </div>
                  <Badge
                    variant={
                      s.status === "feedback_ready" ? "success" : "accent"
                    }
                  >
                    {s.status === "feedback_ready"
                      ? "Feedback ready ✓"
                      : "Awaiting feedback"}
                  </Badge>
                </div>
                <p className="text-sm text-ink-light/75 line-clamp-2 leading-relaxed">
                  {s.audio_url ? "[Audio submission]" : s.content}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
