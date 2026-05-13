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
const MIN_TEXT_CHARS = 300;

export function SubmissionForm({
  exerciseId,
  exerciseType,
  existing,
}: SubmissionFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [audio, setAudio] = useState<AudioRecorderHandle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft once (text only — audio drafts aren't kept)
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY(exerciseId));
    if (saved) setContent(saved);
  }, [exerciseId]);

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

    if (exerciseType === "text" && content.trim().length < MIN_TEXT_CHARS) {
      setError(
        `Please write at least ${MIN_TEXT_CHARS} characters — specifics matter more than polish.`,
      );
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
      const { error: insertErr } = await supabase.from("submissions").insert({
        user_id: user.id,
        exercise_id: exerciseId,
        content: content.trim() || (audio ? `[Audio submission · ${audio.durationSec}s]` : ""),
        audio_url: audioUrl,
        status: "pending_review",
      });
      if (insertErr) throw insertErr;

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

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>
          {content.length} characters · {wordCount} words
          {exerciseType === "text" && content.length < MIN_TEXT_CHARS && (
            <span className="text-warn ml-2">(min {MIN_TEXT_CHARS})</span>
          )}
        </span>
        <span>Draft saved automatically</span>
      </div>

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
          {submitting ? "Submitting…" : "Submit for feedback"}
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
