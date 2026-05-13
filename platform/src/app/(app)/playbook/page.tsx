import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile, getMyPlaybook } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const [profile, playbook] = await Promise.all([
    getCurrentProfile(),
    getMyPlaybook(),
  ]);
  const isReady = playbook !== null;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <header className="text-center mb-12">
        <div className="eyebrow mb-3">Week 6 deliverable</div>
        <h1 className="font-serif text-4xl md:text-6xl font-medium leading-tight">
          Your personal <em className="accent-text">playbook</em>
        </h1>
      </header>

      {isReady ? (
        <article className="bg-bg-card border border-accent/30 rounded-sm p-8 md:p-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium mb-1">
                Communication playbook
              </h2>
              <p className="text-sm text-ink-muted">
                Generated {formatDate(playbook.generated_at)} from your six weeks of data.
              </p>
            </div>
            <Badge variant="success">Generated</Badge>
          </div>

          <div className="aspect-[4/3] bg-white/5 rounded-sm border border-white/10 flex items-center justify-center mb-6">
            <a
              href={playbook.pdf_url}
              target="_blank"
              rel="noopener"
              className="text-accent hover:underline text-sm tracking-[0.18em] uppercase"
            >
              Open PDF in new tab →
            </a>
          </div>

          <a
            href={playbook.pdf_url}
            download
            className="inline-flex items-center justify-center h-11 px-7 bg-accent text-bg-dark text-xs font-semibold uppercase tracking-[0.18em] rounded-sm hover:bg-accent-deep transition-colors"
          >
            Download PDF
          </a>
        </article>
      ) : (
        <article className="bg-bg-card border border-white/5 rounded-sm p-8 md:p-12 text-center">
          <div className="text-6xl mb-6 opacity-30">⌬</div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-4">
            Your playbook is being built
          </h2>
          <p className="text-base md:text-lg text-ink-light/80 leading-relaxed max-w-xl mx-auto">
            Throughout the 6 weeks, Bettina and the AI identify your patterns,
            your wins, and your high-performance frameworks. At Week 6, your
            personal playbook will appear here — generated entirely from your own
            data.
          </p>
          {profile && profile.current_week < 6 && (
            <p className="mt-6 text-sm text-ink-muted">
              {6 - profile.current_week + 1}{" "}
              {6 - profile.current_week + 1 === 1 ? "week" : "weeks"} to go.
            </p>
          )}
        </article>
      )}
    </div>
  );
}
