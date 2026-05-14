import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getStudentById, getStudentPlaybook } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PlaybookUploadForm } from "./PlaybookUploadForm";
import { AIPlaybookDraft } from "./AIPlaybookDraft";

export const dynamic = "force-dynamic";

export default async function AdminPlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, playbook] = await Promise.all([
    getStudentById(id),
    getStudentPlaybook(id),
  ]);
  if (!student) notFound();
  const studentName =
    `${student.first_name} ${student.last_name}`.trim() || student.email;

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
        / Playbook
      </nav>

      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-2">Week 6 deliverable</div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
            {playbook ? "Replace playbook" : "Upload playbook"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">For {studentName}</p>
        </div>
        {playbook && (
          <div className="text-right">
            <Badge variant="success">Current PDF</Badge>
            <p className="text-xs text-ink-muted mt-2">
              {formatDate(playbook.generated_at)}
            </p>
          </div>
        )}
      </header>

      {playbook && (
        <div className="mb-6 bg-bg-card border border-white/5 rounded-sm p-5">
          <div className="text-xs tracking-[0.18em] uppercase text-ink-muted mb-2">
            Currently active
          </div>
          <a
            href={playbook.pdf_url}
            target="_blank"
            rel="noopener"
            className="text-accent hover:underline text-sm break-all"
          >
            {playbook.pdf_url}
          </a>
        </div>
      )}

      <div className="bg-bg-card border border-accent/20 rounded-sm p-6 md:p-8">
        <PlaybookUploadForm
          userId={id}
          existingUrl={playbook?.pdf_url ?? ""}
        />
      </div>

      <p className="mt-6 mb-10 text-xs text-ink-muted leading-relaxed">
        The student sees the playbook on their <span className="text-ink-light">/playbook</span> page
        with a download link. Files go to the private <span className="text-ink-light">playbooks</span>{" "}
        Supabase Storage bucket; the URL stored here is a signed, time-limited link generated on
        upload.
      </p>

      <AIPlaybookDraft userId={id} />
    </div>
  );
}
