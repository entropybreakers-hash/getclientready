import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Markdown } from "@/components/ui/Markdown";
import {
  getStudentById,
  getStudentPatternReports,
  getStudentPlaybook,
  listSubmissionsForAdmin,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { StudentWeekForm } from "./StudentWeekForm";
import { WelcomeMessageDialog } from "./WelcomeMessageDialog";
import { PLATFORM_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const [reports, playbook, allSubs] = await Promise.all([
    getStudentPatternReports(id),
    getStudentPlaybook(id),
    listSubmissionsForAdmin({ status: "all", limit: 200 }),
  ]);
  const studentSubs = allSubs.filter((s) => s.user_id === id);
  const pending = studentSubs.filter((s) => s.status === "pending_review").length;

  const week1Report = reports.find((r) => r.type === "diagnostic_week1");
  const week6Report = reports.find((r) => r.type === "summary_week6");
  const pct = Math.round(((student.current_week - 1) / 6) * 100);
  const studentName =
    `${student.first_name} ${student.last_name}`.trim() || student.email;

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10">
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted flex flex-wrap gap-x-1">
        <Link href="/admin" className="hover:text-accent">
          Admin
        </Link>
        <span>/</span>
        <span className="break-words">{studentName}</span>
      </nav>

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-2">Student profile</div>
          <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight">
            {studentName}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{student.email}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge variant="accent">
            {student.tier.charAt(0).toUpperCase() + student.tier.slice(1)}
          </Badge>
          {pending > 0 && (
            <Badge variant="warn">{pending} pending feedback</Badge>
          )}
        </div>
      </header>

      {/* Onboarding */}
      <WelcomeMessageDialog
        userId={student.user_id}
        studentFirstName={student.first_name || studentName}
        studentEmail={student.email}
        studentWhatsapp={student.whatsapp ?? null}
        platformUrl={PLATFORM_URL}
      />

      {/* Progress + week control */}
      <section className="bg-bg-card border border-white/5 rounded-sm p-6 md:p-8">
        <h2 className="eyebrow mb-3">Progress</h2>
        <div className="flex items-end justify-between mb-3">
          <div className="font-serif text-4xl font-medium">
            Week {student.current_week}{" "}
            <span className="text-2xl text-ink-muted">/ 6</span>
          </div>
          <div className="text-sm text-ink-muted">
            Started {formatDate(student.started_at)}
          </div>
        </div>
        <ProgressBar value={pct} className="mb-5" />
        <StudentWeekForm
          userId={student.user_id}
          currentWeek={student.current_week}
          status={student.status}
        />
      </section>

      {/* Pattern reports */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-serif text-2xl md:text-3xl font-medium">
            Pattern reports
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <PatternReportCard
            userId={student.user_id}
            type="diagnostic_week1"
            label="Week 1 — Diagnostic"
            report={week1Report}
          />
          <PatternReportCard
            userId={student.user_id}
            type="summary_week6"
            label="Week 6 — Summary"
            report={week6Report}
          />
        </div>
      </section>

      {/* Playbook */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-serif text-2xl md:text-3xl font-medium">Playbook</h2>
        </div>
        <div className="bg-bg-card border border-white/5 rounded-sm p-6 md:p-7">
          {playbook ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="success">Uploaded</Badge>
                <span className="text-xs text-ink-muted">
                  {formatDate(playbook.generated_at)}
                </span>
              </div>
              <a
                href={playbook.pdf_url}
                target="_blank"
                rel="noopener"
                className="text-accent hover:underline text-sm tracking-[0.18em] uppercase"
              >
                Open PDF →
              </a>
              <div className="mt-4">
                <Link
                  href={`/admin/students/${student.user_id}/playbook`}
                  className="text-xs tracking-[0.18em] uppercase text-ink-muted hover:text-accent"
                >
                  Replace PDF →
                </Link>
              </div>
            </>
          ) : (
            <>
              <Badge variant="default">Not uploaded yet</Badge>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                The student sees a "Your playbook is being built" placeholder on{" "}
                <span className="text-ink-light">/playbook</span> until you upload one.
              </p>
              <Link
                href={`/admin/students/${student.user_id}/playbook`}
                className="mt-4 inline-block text-xs tracking-[0.18em] uppercase text-accent hover:underline"
              >
                Upload playbook PDF →
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Submissions */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-serif text-2xl md:text-3xl font-medium">
            Their submissions
          </h2>
          <span className="text-xs text-ink-muted">{studentSubs.length} total</span>
        </div>
        {studentSubs.length === 0 ? (
          <p className="text-sm text-ink-muted">No submissions yet.</p>
        ) : (
          <div className="bg-bg-card border border-white/5 rounded-sm overflow-hidden">
            {studentSubs.map((s) => (
              <Link
                key={s.id}
                href={`/admin/submissions/${s.id}`}
                className="block px-6 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-1">
                      Week {s.exercise.week_number} · {s.module_title}
                    </div>
                    <div className="font-medium text-ink-light truncate">
                      {s.exercise.title}
                    </div>
                  </div>
                  <Badge
                    variant={s.status === "feedback_ready" ? "success" : "warn"}
                  >
                    {s.status === "feedback_ready" ? "Sent" : "Awaiting"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PatternReportCard({
  userId,
  type,
  label,
  report,
}: {
  userId: string;
  type: "diagnostic_week1" | "summary_week6";
  label: string;
  report: { content: string; generated_at: string } | undefined;
}) {
  return (
    <Link
      href={`/admin/students/${userId}/pattern-report?type=${type}`}
      className="block bg-bg-card border border-white/5 rounded-sm p-6 hover:border-accent/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow">{label}</div>
        <Badge variant={report ? "success" : "default"}>
          {report ? "Generated" : "Pending"}
        </Badge>
      </div>
      {report ? (
        <>
          <div className="text-sm text-ink-light/80 line-clamp-4 leading-relaxed">
            {report.content.replace(/[*_#`>]/g, "")}
          </div>
          <div className="mt-3 text-xs text-ink-muted">
            {formatDate(report.generated_at)}
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-muted">Click to write the {label} report.</p>
      )}
      <div className="mt-3 text-xs tracking-[0.18em] uppercase text-accent">
        {report ? "Edit" : "Write"} →
      </div>
    </Link>
  );
}
