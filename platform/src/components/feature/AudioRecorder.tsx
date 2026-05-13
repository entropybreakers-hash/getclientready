"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface AudioRecorderHandle {
  blob: Blob;
  mimeType: string;
  durationSec: number;
}

interface AudioRecorderProps {
  onChange: (handle: AudioRecorderHandle | null) => void;
  disabled?: boolean;
  maxSeconds?: number;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onChange,
  disabled = false,
  maxSeconds = 300,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      onChange(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : "";

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const sec = Math.round((Date.now() - startedAtRef.current) / 1000);
        onChange({ blob, mimeType: recorder.mimeType || "audio/webm", durationSec: sec });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setDuration(0);
      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxSeconds) stop();
      }, 250);
    } catch (err) {
      if ((err as Error).name === "NotAllowedError") {
        setPermissionDenied(true);
      } else {
        setError((err as Error).message || "Could not start recording");
      }
    }
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDuration(0);
    onChange(null);
  }

  if (permissionDenied) {
    return (
      <div className="bg-bg-card border border-warn/30 rounded-sm p-5">
        <p className="text-sm text-warn mb-2 font-medium">
          Microphone access denied.
        </p>
        <p className="text-xs text-ink-muted leading-relaxed">
          To record audio, your browser needs permission. Click the lock icon in
          your address bar → allow microphone → reload this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-bg-card border border-white/10 rounded-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-block w-3 h-3 rounded-full transition-colors",
                recording ? "bg-warn animate-pulse" : "bg-white/20",
              )}
            />
            <div>
              <div className="text-sm font-medium">
                {recording
                  ? "Recording…"
                  : previewUrl
                    ? "Recorded ✓"
                    : "Ready to record"}
              </div>
              <div className="text-xs text-ink-muted">
                {formatTime(duration)} / {formatTime(maxSeconds)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!recording && !previewUrl && (
              <Button
                type="button"
                onClick={start}
                disabled={disabled}
                size="sm"
              >
                Start
              </Button>
            )}
            {recording && (
              <Button
                type="button"
                onClick={stop}
                size="sm"
                variant="outline"
              >
                Stop
              </Button>
            )}
            {!recording && previewUrl && (
              <Button
                type="button"
                onClick={clear}
                size="sm"
                variant="outline"
              >
                Re-record
              </Button>
            )}
          </div>
        </div>

        {previewUrl && !recording && (
          <audio
            controls
            src={previewUrl}
            className="w-full mt-4"
            preload="metadata"
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-ink-muted">
        Max {Math.floor(maxSeconds / 60)} minutes. Recording stays on your
        device until you submit.
      </p>
    </div>
  );
}
