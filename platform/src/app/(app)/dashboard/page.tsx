import Link from "next/link";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { getDashboardData } from "@/lib/data";
import { formatDate, relativeTime } from "@/lib/utils";
import { SUPPORT_WHATSAPP } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const {
    profile,
    currentModule,
    recentFeedback,
    patternReport,
    exercisesCompleted,
    exercisesTotal,
  } = data;

  const weekPct = Math.round(((profile.current_week - 1) / 6) * 100);
  const patternsCount = patternReport ? patternReport.content.split("\n").filter((l) => l.startsWith("**Primary") || l.includes("pattern:")).length : 0;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-8">
      {/* Hero overview */}
      <section className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="eyebrow mb-2">Your Program</div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
              You are in Week {profile.current_week} of 6
            </h1>
            <p className="mt-2 text-base md:text-lg text-ink-muted font-serif italic">
              This week:{" "}
              <span className="text-ink-light not-italic">
                {currentModule.title}
              </span>{" "}
              — {currentModule.subtitle}
            </p>
          </div>
          <Badge variant="accent">
            {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} tier
          </Badge>
        </div>

        <ProgressBar value={weekPct} className="mb-6" />

        <Link href={`/modules/${currentModule.slug}`}>
          <Button>Continue Week {profile.current_week} →</Button>
        </Link>
      </section>

      {/* Quick stats */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardEyebrow>Exercises completed</CardEyebrow>
          <div className="font-serif text-4xl md:text-5xl font-medium">
            {exercisesCompleted}{" "}
            <span className="text-ink-muted text-2xl">/ {exercisesTotal}</span>
          </div>
        </Card>
        <Card>
          <CardEyebrow>Patterns identified</CardEyebrow>
          <div className="font-serif text-4xl md:text-5xl font-medium">
            {patternReport
              ? Array.from(
                  new Set(
                    recentFeedback.flatMap((f) => f.feedback.patterns_identified),
                  ),
                ).length
              : "—"}
          </div>
          {!patternReport && (
            <p className="mt-1 text-xs text-ink-muted">Coming after Week 1</p>
          )}
        </Card>
        <Card>
          <CardEyebrow>Next session</CardEyebrow>
          <div className="font-serif text-xl md:text-2xl font-medium leading-tight">
            Schedule via WhatsApp
          </div>
          {SUPPORT_WHATSAPP && (
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`}
              className="mt-3 inline-block text-xs tracking-[0.18em] uppercase text-accent hover:underline"
              target="_blank"
              rel="noopener"
            >
              Open chat →
            </a>
          )}
        </Card>
      </section>

      {/* Recent feedback */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-serif text-2xl md:text-3xl font-medium">
            Latest feedback from Bettina
          </h2>
          <Link
            href="/submissions"
            className="text-xs tracking-[0.18em] uppercase text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        {recentFeedback.length === 0 ? (
          <Card>
            <CardEyebrow>No feedback yet</CardEyebrow>
            <p className="text-ink-muted text-sm">
              Submit your first exercise to receive personalised feedback within 24 hours.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recentFeedback.map(({ feedback, submission }) => (
              <Link
                key={feedback.id}
                href={`/submissions/${submission.id}`}
                className="block bg-bg-card border border-white/5 rounded-sm p-6 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="eyebrow">Week {submission.exercise.week_number}</div>
                  <span className="text-xs text-ink-muted">
                    {relativeTime(feedback.created_at)}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium mb-2 leading-snug">
                  {submission.exercise.title}
                </h3>
                <p className="text-sm text-ink-light/70 line-clamp-3 leading-relaxed">
                  {feedback.content
                    .replace(/[*_#`>]/g, "")
                    .slice(0, 140)}
                  …
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {feedback.patterns_identified.slice(0, 2).map((p) => (
                    <Badge key={p} variant="accent">
                      {p}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pattern report */}
      {patternReport && (
        <section>
          <Card className="border-accent/20">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <CardEyebrow>Your Pattern Report</CardEyebrow>
                <h2 className="font-serif text-2xl md:text-3xl font-medium leading-snug">
                  Where you lose authority — and what fixes it
                </h2>
              </div>
              <Badge variant="success">Generated</Badge>
            </div>
            <p className="text-sm text-ink-muted mb-4">
              Last updated {formatDate(patternReport.generated_at)}.
            </p>
            <p className="text-base text-ink-light/85 line-clamp-3 leading-relaxed">
              {patternReport.content.replace(/[*_#`>]/g, "").slice(0, 220)}…
            </p>
            <Link
              href="/profile#patterns"
              className="mt-5 inline-block text-xs tracking-[0.18em] uppercase text-accent hover:underline"
            >
              View full report →
            </Link>
          </Card>
        </section>
      )}

      {/* Help */}
      <section className="text-center pt-6 border-t border-white/5">
        <p className="text-sm text-ink-muted">
          Need help? Reach Bettina on{" "}
          {SUPPORT_WHATSAPP ? (
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`}
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener"
            >
              WhatsApp
            </a>
          ) : (
            <a
              href="mailto:baranyibettina@entropybreakers.com"
              className="text-accent hover:underline"
            >
              email
            </a>
          )}
          .
        </p>
      </section>
    </div>
  );
}
