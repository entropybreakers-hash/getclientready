import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import {
  getExercisesByModule,
  getModuleBySlug,
  getModulesWithStatus,
  getMySubmissions,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = await getModuleBySlug(slug);
  if (!mod || mod.status === "locked") notFound();

  const [exercises, allSubs, modules] = await Promise.all([
    getExercisesByModule(mod.id),
    getMySubmissions(),
    getModulesWithStatus(),
  ]);

  const prev = modules.find((m) => m.week_number === mod.week_number - 1);
  const next = modules.find((m) => m.week_number === mod.week_number + 1);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-6">
        <Link href="/modules" className="hover:text-accent">
          Modules
        </Link>{" "}
        / Week {mod.week_number}: {mod.title}
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="eyebrow mb-3">Week {mod.week_number}</div>
        <h1 className="font-serif text-5xl md:text-7xl font-medium uppercase tracking-tight leading-none">
          {mod.title}
        </h1>
        <p className="mt-5 font-serif italic text-xl md:text-2xl text-accent leading-snug max-w-xl">
          {mod.subtitle}
        </p>
      </header>

      {/* Content */}
      <section className="mb-12">
        <Markdown>{mod.content}</Markdown>
      </section>

      {/* Exercises */}
      <section className="mb-14">
        <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">
          This week&apos;s exercises
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          {exercises.length} total · submit when ready, feedback within 24 hours.
        </p>
        <div className="space-y-3">
          {exercises.map((ex) => {
            const subs = allSubs.filter((s) => s.exercise_id === ex.id);
            const last = subs[subs.length - 1];
            const status = !last
              ? "available"
              : last.status === "feedback_ready"
                ? "feedback_ready"
                : "submitted";
            return (
              <Link
                key={ex.id}
                href={`/exercises/${ex.id}`}
                className="block bg-bg-card border border-white/5 rounded-sm p-6 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted">
                        Exercise {ex.order}
                      </div>
                      <Badge variant="default">{ex.type}</Badge>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-medium leading-snug">
                      {ex.title}
                    </h3>
                  </div>
                  <Badge
                    variant={
                      status === "feedback_ready"
                        ? "success"
                        : status === "submitted"
                          ? "accent"
                          : "default"
                    }
                  >
                    {status === "feedback_ready"
                      ? "Feedback ready ✓"
                      : status === "submitted"
                        ? "Submitted"
                        : "Begin →"}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom nav */}
      <nav className="flex items-center justify-between pt-8 border-t border-white/5 text-sm">
        {prev && prev.status !== "locked" ? (
          <Link
            href={`/modules/${prev.slug}`}
            className="text-ink-muted hover:text-accent transition-colors"
          >
            ← Week {prev.week_number}: {prev.title}
          </Link>
        ) : (
          <span className="text-ink-muted/50">
            {prev ? `← Week ${prev.week_number} (locked)` : ""}
          </span>
        )}
        {next && next.status !== "locked" ? (
          <Link
            href={`/modules/${next.slug}`}
            className="text-ink-muted hover:text-accent transition-colors"
          >
            Week {next.week_number}: {next.title} →
          </Link>
        ) : (
          <span className={cn("text-ink-muted/50", !next && "hidden")}>
            Week {next?.week_number} (locked) →
          </span>
        )}
      </nav>
    </div>
  );
}
