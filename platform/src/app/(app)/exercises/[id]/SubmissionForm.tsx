"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { AudioRecorder, type AudioRecorderHandle } from "@/components/feature/AudioRecorder";
import { USE_MOCK } from "@/lib/env";
import type { ExerciseType, SubmissionWithRelations } from "@/lib/types";

interface SubmissionFormProps {
  exerciseId: string;
  exerciseType: ExerciseType;
  existing: SubmissionWithRelations | null;
}

const DRAFT_KEY = (id: string) => `gcr_draft_${id}`;

export function SubmissionForm({
  exerciseId,
  exerciseType,
  existing,
}: SubmissionFormProps) {
  const router = useRouter();
  // A submission that is still "pending_review" can be edited and resubmitted
  // (Bettina has not given feedback yet). "feedback_ready" ones are locked.
  const isEditing = !!existing && existing.status === "pending_review";
  const existingNotes =
    existing &&
    existing.content &&
    !existing.content.startsWith("[Audio submission")
      ? existing.content
      : "";
  const [content, setContent] = useState(existingNotes);
  const [audio, setAudio] = useState<AudioRecorderHandle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load a saved draft — but not when editing an already-submitted entry,
  // where the submitted text is the authoritative starting point.
  useEffect(() => {
    if (isEditing) return;
    const saved = localStorage.getItem(DRAFT_KEY(exerciseId));
    if (saved) setContent(saved);
  }, [exerciseId, isEditing]);

  // Save draft on change
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

  if (submitted) {
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

  async function uploadAudio(handle: AudioRecorderHandle, userId: string): Promise<string> {
    const { getBrowserClient } = await import("@/lib/supabase/client");
    const supabase = getBrowserClient();
    const ext =
      handle.mimeType.includes("mp4")
        ? "m4a"
        : handle.mimeType.includes("ogg")
          ? "ogg"
          : "webm";
    const path = `${userId}/${exerciseId}-${Date.now()}.${ext}`;

    setProgress(20);
    const { error: upErr } = await supabase.storage
      .from("audio-submissions")
      .upload(path, handle.blob, {
        contentType: handle.mimeType,
        upsert: false,
      });
    if (upErr) throw new Error(`Audio upload failed: ${upErr.message}`);
    setProgress(60);

    // Signed URL valid for 1 year so playback works whenever the submission is opened.
    const { data: signed, error: signErr } = await supabase.storage
      .from("audio-submissions")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed?.signedUrl) {
      throw new Error(`Could not generate audio access link: ${signErr?.message ?? "unknown"}`);
    }
    setProgress(85);
    return signed.signedUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (exerciseType === "text" && content.trim().length === 0) {
      setError("Please write something before submitting.");
      return;
    }
    if (exerciseType === "audio" && !audio) {
      setError("Please record an audio response before submitting.");
      return;
    }

    setSubmitting(true);
    setProgress(5);

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        localStorage.removeItem(DRAFT_KEY(exerciseId));
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      const { getBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      let audioUrl: string | null = null;
      if (audio) {
        audioUrl = await uploadAudio(audio, user.id);
      }

      setProgress(90);
      const row = {
        content:
          content.trim() ||
          (audio ? `[Audio submission · ${audio.durationSec}s]` : ""),
        audio_url: audioUrl,
      };
      if (isEditing) {
        // Re-recording before review: replace the still-pending submission.
        // transcript is cleared — any earlier recording's transcript is stale.
        const { error: updateErr } = await supabase
          .from("submissions")
          .update({
            ...row,
            transcript: null,
            status: "pending_review",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing!.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("submissions")
          .insert({
            ...row,
            user_id: user.id,
            exercise_id: exerciseId,
            status: "pending_review",
          });
        if (insertErr) throw insertErr;
      }

      setProgress(100);
      localStorage.removeItem(DRAFT_KEY(exerciseId));
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
      setProgress(0);
    }
  }

  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  const isAudio = exerciseType === "audio";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isEditing && (
        <div className="bg-accent/10 border border-accent/30 rounded-sm px-4 py-3 text-sm text-ink-light/90 leading-relaxed">
          You&apos;re editing a submission that hasn&apos;t been reviewed yet.{" "}
          {isAudio
            ? "Record a new response below — it replaces the previous one."
            : "Update your response below — it replaces the previous one."}
        </div>
      )}

      {isAudio && (
        <AudioRecorder onChange={setAudio} disabled={submitting} maxSeconds={300} />
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          isAudio
            ? "Optional notes alongside your recording (e.g. what you were thinking)…"
            : "Start writing… Drafts save automatically."
        }
        rows={10}
        className={isAudio ? "min-h-[140px]" : "min-h-[280px]"}
      />

      <div className="flex items-center justify-between text-xs text-ink-muted gap-3 flex-wrap">
        <span>
          {content.length} characters · {wordCount} words
        </span>
        <span>Draft saved automatically</span>
      </div>

      {!isAudio && (
        <p className="text-xs text-ink-muted italic leading-relaxed">
          The more detailed your response, the sharper the analysis you&apos;ll get back. Match the depth to what the prompt is asking — there&apos;s no minimum length.
        </p>
      )}

      {submitting && (
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={
            submitting ||
            (isAudio ? !audio : content.trim().length === 0)
          }
        >
          {submitting
            ? isEditing
              ? "Resubmitting…"
              : "Submitting…"
            : isEditing
              ? "Resubmit"
              : "Submit for feedback"}
        </Button>
        {!isAudio && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              localStorage.setItem(DRAFT_KEY(exerciseId), content);
            }}
          >
            Save draft
          </Button>
        )}
      </div>
    </form>
  );
}
