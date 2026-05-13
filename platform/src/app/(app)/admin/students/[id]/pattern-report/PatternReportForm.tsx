"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Markdown } from "@/components/ui/Markdown";
import { savePatternReportAction } from "@/lib/actions";

interface Props {
  userId: string;
  type: "diagnostic_week1" | "summary_week6";
  initialContent: string;
  hasExisting: boolean;
}

export function PatternReportForm({
  userId,
  type,
  initialContent,
  hasExisting,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await savePatternReportAction({ userId, type, content });
      if (!res.ok) {
        setError(res.error ?? "Save failed");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={
            !preview
              ? "px-3 py-1 bg-accent text-bg-dark rounded-sm font-medium tracking-[0.18em] uppercase"
              : "px-3 py-1 border border-white/10 text-ink-muted hover:text-accent rounded-sm tracking-[0.18em] uppercase"
          }
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={
            preview
              ? "px-3 py-1 bg-accent text-bg-dark rounded-sm font-medium tracking-[0.18em] uppercase"
              : "px-3 py-1 border border-white/10 text-ink-muted hover:text-accent rounded-sm tracking-[0.18em] uppercase"
          }
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div className="min-h-[400px] bg-bg-dark border border-white/10 rounded-sm p-5">
          {content.trim() ? (
            <Markdown>{content}</Markdown>
          ) : (
            <p className="text-sm text-ink-muted italic">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`**Your primary pattern:** Translation Lag

**Secondary patterns:** Hedging on commitments, Trailing off.

**Strongest signal:** ...

**Where it costs you most:** ...`}
          className="min-h-[400px] font-mono text-sm"
        />
      )}

      <div className="text-xs text-ink-muted">
        {content.length} chars · markdown supported (bold, italics, headings, lists, blockquotes)
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-success bg-success/10 border border-success/30 rounded-sm px-3 py-2">
          Saved. Student sees the update on next load.
        </p>
      )}

      <Button type="submit" disabled={isPending || !content.trim()}>
        {isPending ? "Saving…" : hasExisting ? "Update report" : "Generate report"}
      </Button>
    </form>
  );
}
