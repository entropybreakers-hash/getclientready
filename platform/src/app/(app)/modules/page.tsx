import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getModulesWithStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ModuleStatus, string> = {
  locked: "Locked",
  available: "Start",
  in_progress: "Continue",
  completed: "Review",
};

const STATUS_VARIANT: Record<
  ModuleStatus,
  "default" | "accent" | "success" | "warn"
> = {
  locked: "default",
  available: "accent",
  in_progress: "accent",
  completed: "success",
};

export default async function ModulesPage() {
  const modules = await getModulesWithStatus();
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <header className="mb-10 md:mb-14">
        <div className="eyebrow mb-2">Program structure</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          6 weeks. <em className="accent-text">6 permanent shifts.</em>
        </h1>
        <p className="mt-4 text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
          Each week is one module. Locked weeks unlock as you progress through the program.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {modules.map((m) => {
          const locked = m.status === "locked";
          const pct = m.progress
            ? Math.round(
                (m.progress.exercises_completed / Math.max(1, m.progress.exercises_total)) *
                  100,
              )
            : 0;

          const Inner = (
            <article
              className={cn(
                "h-full bg-bg-card border border-white/5 rounded-sm p-7 md:p-8 transition-colors",
                !locked && "hover:border-accent/30",
                locked && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="eyebrow mb-2">Week {m.week_number}</div>
                  <h2 className="font-serif text-3xl md:text-4xl font-medium uppercase tracking-tight">
                    {m.title}
                  </h2>
                </div>
                <Badge variant={STATUS_VARIANT[m.status]}>
                  {STATUS_LABEL[m.status]}
                  {m.status === "completed" ? " ✓" : ""}
                </Badge>
              </div>
              <p className="text-base text-ink-light/80 leading-relaxed">
                {m.subtitle}
              </p>
              {m.progress && m.status !== "completed" && (
                <div className="mt-5">
                  <div className="flex justify-between text-[0.65rem] tracking-[0.18em] uppercase text-ink-muted mb-2">
                    <span>
                      {m.progress.exercises_completed} of {m.progress.exercises_total} exercises
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              )}
              {!locked && (
                <p className="mt-6 text-xs tracking-[0.18em] uppercase text-accent">
                  {STATUS_LABEL[m.status]} →
                </p>
              )}
            </article>
          );

          return locked ? (
            <div key={m.id}>{Inner}</div>
          ) : (
            <Link key={m.id} href={`/modules/${m.slug}`} className="block">
              {Inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
