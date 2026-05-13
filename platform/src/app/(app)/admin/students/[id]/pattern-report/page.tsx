import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getStudentById, getStudentPatternReports } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PatternReportForm } from "./PatternReportForm";

export const dynamic = "force-dynamic";

export default async function AdminPatternReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type: rawType } = await searchParams;
  const type =
    rawType === "summary_week6" ? "summary_week6" : "diagnostic_week1";

  const [student, reports] = await Promise.all([
    getStudentById(id),
    getStudentPatternReports(id),
  ]);
  if (!student) notFound();
  const existing = reports.find((r) => r.type === type);
  const studentName =
    `${student.first_name} ${student.last_name}`.trim() || student.email;

  const label =
    type === "diagnostic_week1" ? "Week 1 — Diagnostic" : "Week 6 — Summary";

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <nav className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-6">
        <Link href="/admin" className="hover:text-accent">
          Admin
        </Link>{" "}
        /{" "}
        <Link href={`/admin/students/${id}`} className="hover:text-accent">
          {studentName}
        </Link>{" "}
        / Pattern report
      </nav>

      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-2">{label}</div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
            {existing ? "Edit" : "Write"} pattern report
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            For {studentName}
          </p>
        </div>
        {existing && (
          <div className="text-right">
            <Badge variant="success">Generated</Badge>
            <p className="text-xs text-ink-muted mt-2">
              Last edit: {formatDate(existing.generated_at)}
            </p>
          </div>
        )}
      </header>

      <div className="bg-bg-card border border-accent/20 rounded-sm p-6 md:p-8">
        <PatternReportForm
          userId={id}
          type={type}
          initialContent={existing?.content ?? ""}
          hasExisting={!!existing}
        />
      </div>

      <p className="mt-6 text-xs text-ink-muted leading-relaxed">
        The student sees this report on their <span className="text-ink-light">/profile</span> page
        (and a preview on the dashboard). Markdown is fully supported — headings, bold, lists,
        blockquotes.
      </p>
    </div>
  );
}
