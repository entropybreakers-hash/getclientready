"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { USE_MOCK } from "@/lib/env";
import type { ExerciseType, SubmissionWithRelations } from "@/lib/types";

interface SubmissionFormProps {
  exerciseId: string;
  exerciseType: ExerciseType;
  existing: SubmissionWithRelations | null;
}

const DRAFT_KEY = (id: string) => `gcr_draft_${id}`;
const MIN_TEXT_CHARS = 300;

export function SubmissionForm({
  exerciseId,
  exerciseType,
  existing,
}: SubmissionFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft once
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY(exerciseId));
    if (saved) setContent(saved);
  }, [exerciseId]);

  // Save draft every 30s
  useEffect(() => {
    if (draftRef.current) clearTimeout(draftRef.current);
    draftRef.current = setTimeout(() => {
      if (content) localStorage.setItem(DRAFT_KEY(exerciseId), content);
    }, 1500);
    return () => {
      if (draftRef.current) clearTimeout(draftRef.current);
    };
  }, [content, exerciseId]);

  if (existing && existing.status === "feedback_ready") {
    return (
      <div className="bg-bg-card border border-success/30 rounded-sm p-6">
        <p className="font-serif text-xl text-ink-light leading-snug mb-2">
          Feedback is ready.
        </p>
        <p className="text-sm text-ink-muted mb-5">
          You&apos;ve already received personalised feedback on your last submission.
        </p>
        <Button onClick={() => router.push(`/submissions/${existing.id}`)}>
          View feedback →
        </Button>
      </div>
    );
  }

  if (submitted || (existing && existing.status === "pending_review")) {
    return (
      <div className="bg-bg-card border border-accent/30 rounded-sm p-6">
        <p className="font-serif text-xl text-ink-light leading-snug mb-2">
          Your submission is being analysed.
        </p>
        <p className="text-sm text-ink-muted">
          You&apos;ll receive Bettina&apos;s feedback within 24 hours.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (exerciseType === "text" && content.trim().length < MIN_TEXT_CHARS) {
      setError(
        `Please write at least ${MIN_TEXT_CHARS} characters — specifics matter more than polish.`,
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        localStorage.removeItem(DRAFT_KEY(exerciseId));
        setSubmitted(true);
        setSubmitting(false);
        return;
      }
      // Live mode: insert into Supabase
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error: insertErr } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          content,
          status: "pending_review",
        });
      if (insertErr) throw insertErr;
      localStorage.removeItem(DRAFT_KEY(exerciseId));
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  }

  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {exerciseType === "audio" && (
        <p className="text-sm text-ink-muted bg-bg-card border border-white/5 rounded-sm p-4 leading-relaxed">
          Audio recording is coming in Phase 2. For now, write your response below
          or upload audio via WhatsApp.
        </p>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing… Drafts save automatically."
        rows={10}
        className="min-h-[280px]"
      />

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>
          {content.length} characters · {wordCount} words
          {exerciseType === "text" && content.length < MIN_TEXT_CHARS && (
            <span className="text-warn ml-2">
              (min {MIN_TEXT_CHARS})
            </span>
          )}
        </span>
        <span>Draft saved automatically</span>
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting || content.trim().length === 0}>
          {submitting ? "Submitting…" : "Submit for feedback"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            localStorage.setItem(DRAFT_KEY(exerciseId), content);
          }}
        >
          Save draft
        </Button>
      </div>
    </form>
  );
}
