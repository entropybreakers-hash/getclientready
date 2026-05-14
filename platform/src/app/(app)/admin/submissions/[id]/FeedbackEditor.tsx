"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import { generateFeedbackDraftAction, submitFeedbackAction } from "@/lib/actions";

interface FeedbackEditorProps {
  submissionId: string;
  initialContent: string;
  initialPatterns: string[];
  hasFeedback: boolean;
}

const DRAFT_KEY = (id: string) => `gcr_admin_feedback_draft_${id}`;

const COMMON_PATTERNS = [
  "translation lag",
  "hedging",
  "identity shift",
  "trailing off",
  "structure gap",
  "freeze",
  "framework integration",
];

export function FeedbackEditor({
  submissionId,
  initialContent,
  initialPatterns,
  hasFeedback,
}: FeedbackEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [patterns, setPatterns] = useState<string[]>(initialPatterns);
  const [newPattern, setNewPattern] = useState("");
  const [preview, setPreview] = useState(false);
  const [drafting, startDrafting] = useTransition();
  const [draftError, setDraftError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load draft on mount (if no existing feedback)
  if (!hasFeedback && content === "" && typeof window !== "undefined") {
    const saved = window.localStorage.getItem(DRAFT_KEY(submissionId));
    if (saved && saved !== "") {
      // setContent inside render is fine because the guard prevents loops
      setContent(saved);
    }
  }

  function onContentChange(v: string) {
    setContent(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAFT_KEY(submissionId), v);
    }
  }

  function addPattern(p: string) {
    const trimmed = p.trim().toLowerCase();
    if (!trimmed || patterns.includes(trimmed)) return;
    setPatterns([...patterns, trimmed]);
    setNewPattern("");
  }

  function removePattern(p: string) {
    setPatterns(patterns.filter((x) => x !== p));
  }

  function onGenerateDraft() {
    if (content.trim() && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    setConfirmReplace(false);
    setDraftError(null);
    startDrafting(async () => {
      const res = await generateFeedbackDraftAction(submissionId);
      if (!res.ok || !res.draft) {
        setDraftError(res.error ?? "Draft generation failed.");
        return;
      }
      onContentChange(res.draft.content);
      // Merge AI-suggested patterns with existing ones (dedupe).
      const merged = Array.from(
        new Set([...patterns, ...res.draft.patterns.map((p) => p.toLowerCase())]),
      );
      setPatterns(merged);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await submitFeedbackAction({
        submissionId,
        content,
        patterns,
      });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong");
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_KEY(submissionId));
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
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

        <button
          type="button"
          onClick={onGenerateDraft}
          disabled={drafting}
          className="inline-flex items-center gap-1.5 px-3 py-1 border border-accent/40 text-accent hover:bg-accent/10 rounded-sm tracking-[0.18em] uppercase text-xs font-medium transition-colors disabled:opacity-50"
        >
          {drafting ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Drafting…
            </>
          ) : confirmReplace ? (
            "Replace with AI draft?"
          ) : content.trim() ? (
            "↻ AI draft"
          ) : (
            "✨ AI draft"
          )}
        </button>
      </div>

      {confirmReplace && !drafting && (
        <p className="text-xs text-ink-muted bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          You already have content — clicking AI draft again will replace it. Click once more to confirm, or{" "}
          <button
            type="button"
            onClick={() => setConfirmReplace(false)}
            className="text-accent hover:underline"
          >
            cancel
          </button>
          .
        </p>
      )}

      {draftError && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {draftError}
        </p>
      )}

      {preview ? (
        <div className="min-h-[280px] bg-bg-dark border border-white/10 rounded-sm p-4">
          {content.trim() ? (
            <Markdown>{content}</Markdown>
          ) : (
            <p className="text-sm text-ink-muted italic">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="**What I'm seeing:**&#10;&#10;...&#10;&#10;**The pattern:**&#10;&#10;...&#10;&#10;**What we'll do next:**&#10;&#10;..."
          className="min-h-[320px] font-mono text-sm"
        />
      )}

      <div className="text-xs text-ink-muted">
        {content.length} chars · {wordCount} words · Markdown supported (bold, italics, lists, blockquotes, headings)
      </div>

      <div className="pt-3 border-t border-white/5">
        <Label>Patterns identified</Label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
          {patterns.length === 0 ? (
            <span className="text-xs text-ink-muted italic">None tagged yet</span>
          ) : (
            patterns.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => removePattern(p)}
                className="group inline-flex items-center gap-1.5 bg-accent/15 border border-accent/30 text-accent text-[0.65rem] tracking-[0.18em] uppercase px-2.5 py-0.5 rounded-sm hover:bg-warn/15 hover:border-warn/40 hover:text-warn transition-colors"
              >
                {p}
                <span className="opacity-50 group-hover:opacity-100">×</span>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPattern(newPattern);
              }
            }}
            placeholder="Add custom pattern…"
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addPattern(newPattern)}
          >
            Add
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {COMMON_PATTERNS.filter((p) => !patterns.includes(p)).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addPattern(p)}
              className="text-[0.6rem] tracking-[0.15em] uppercase px-2 py-0.5 text-ink-muted border border-white/5 rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              + {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-success bg-success/10 border border-success/30 rounded-sm px-3 py-2">
          {hasFeedback ? "Updated. Student sees the change immediately." : "Sent. The student can see it now."}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending
            ? hasFeedback
              ? "Updating…"
              : "Sending…"
            : hasFeedback
              ? "Update feedback"
              : "Send feedback"}
        </Button>
        {!hasFeedback && (
          <Badge variant="warn">Submission will flip to &quot;feedback ready&quot; on send</Badge>
        )}
      </div>
    </form>
  );
}
