"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Markdown } from "@/components/ui/Markdown";
import { generatePlaybookDraftAction } from "@/lib/actions";

interface Props {
  userId: string;
}

export function AIPlaybookDraft({ userId }: Props) {
  const [content, setContent] = useState("");
  const [patterns, setPatterns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drafting, startDrafting] = useTransition();

  function onGenerate() {
    setError(null);
    setCopied(false);
    startDrafting(async () => {
      const res = await generatePlaybookDraftAction(userId);
      if (!res.ok || !res.draft) {
        setError(res.error ?? "Generation failed.");
        return;
      }
      setContent(res.draft.content);
      setPatterns(
        Array.from(new Set(res.draft.patterns.map((p) => p.toLowerCase()))),
      );
    });
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-bg-card border border-accent/20 rounded-sm p-6 md:p-7 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="eyebrow">AI Playbook Draft</h3>
          <p className="mt-2 text-sm text-ink-light/80 leading-relaxed max-w-2xl">
            Claude reads all of the student&apos;s submissions + feedback across
            the six weeks and drafts the full 7-section playbook in your voice.
            Edit, then paste into Pages / Word / Google Docs and export the PDF
            to upload above.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={drafting}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-accent/40 text-accent hover:bg-accent/10 rounded-sm tracking-[0.18em] uppercase text-xs font-medium transition-colors disabled:opacity-50"
        >
          {drafting ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Drafting…
            </>
          ) : content ? (
            "↻ Regenerate"
          ) : (
            "✨ Generate playbook"
          )}
        </button>
      </div>

      {drafting && (
        <p className="text-xs text-ink-muted italic">
          This takes 30-60 seconds. Claude reads every submission and every
          feedback you&apos;ve written.
        </p>
      )}

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {content && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={
                !preview
                  ? "px-3 py-1 bg-accent text-bg-dark rounded-sm font-medium tracking-[0.18em] uppercase text-xs"
                  : "px-3 py-1 border border-white/10 text-ink-muted hover:text-accent rounded-sm tracking-[0.18em] uppercase text-xs"
              }
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={
                preview
                  ? "px-3 py-1 bg-accent text-bg-dark rounded-sm font-medium tracking-[0.18em] uppercase text-xs"
                  : "px-3 py-1 border border-white/10 text-ink-muted hover:text-accent rounded-sm tracking-[0.18em] uppercase text-xs"
              }
            >
              Preview
            </button>
            <div className="ml-auto">
              <Button type="button" size="sm" onClick={copyMarkdown}>
                {copied ? "Copied ✓" : "Copy markdown"}
              </Button>
            </div>
          </div>

          {preview ? (
            <div className="min-h-[500px] bg-bg-dark border border-white/10 rounded-sm p-5 overflow-auto max-h-[700px]">
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] font-mono text-xs"
            />
          )}

          {patterns.length > 0 && (
            <div className="text-xs text-ink-muted">
              Patterns resolved across the program:{" "}
              {patterns.map((p) => (
                <span
                  key={p}
                  className="inline-block mx-1 px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded-sm text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-white/5">
            <strong className="text-ink-light/85">Next steps:</strong> copy the
            markdown, paste into Pages / Word / Google Docs, format and export
            as PDF, then upload using the form above.
          </div>
        </>
      )}
    </div>
  );
}
