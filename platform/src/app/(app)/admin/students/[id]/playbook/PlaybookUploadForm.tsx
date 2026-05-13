"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { savePlaybookAction } from "@/lib/actions";
import { USE_MOCK } from "@/lib/env";

interface Props {
  userId: string;
  existingUrl: string;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function PlaybookUploadForm({ userId, existingUrl }: Props) {
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState(existingUrl);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function uploadFile(f: File): Promise<string | null> {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return null;
    }
    if (f.size > MAX_BYTES) {
      setError("PDF must be 10 MB or smaller.");
      return null;
    }
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setProgress(100);
        setUploading(false);
        return `mock://playbook/${userId}/${f.name}`;
      }

      const { getBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getBrowserClient();
      const path = `${userId}/${Date.now()}-${f.name.replace(/[^a-z0-9._-]/gi, "_")}`;
      setProgress(30);

      const { error: upErr } = await supabase.storage
        .from("playbooks")
        .upload(path, f, { upsert: true, contentType: "application/pdf" });
      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        setUploading(false);
        return null;
      }
      setProgress(70);

      // Signed URL valid for 1 year — long-lived so the student can keep accessing.
      const { data: signed, error: signErr } = await supabase.storage
        .from("playbooks")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr || !signed?.signedUrl) {
        setError(`Could not generate access link: ${signErr?.message ?? "unknown"}`);
        setUploading(false);
        return null;
      }
      setProgress(100);
      setUploading(false);
      return signed.signedUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return null;
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = await uploadFile(f);
    if (url) setPdfUrl(url);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await savePlaybookAction({ userId, pdfUrl });
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
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label>Upload PDF</Label>
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          disabled={uploading}
          className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:bg-accent file:text-bg-dark hover:file:bg-accent-deep file:cursor-pointer cursor-pointer"
        />
        {file && (
          <p className="mt-2 text-xs text-ink-muted">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
        {uploading && (
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div>
        <Label>Or paste a direct PDF URL</Label>
        <Input
          type="url"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="https://…/playbook.pdf"
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          You can host the PDF anywhere with a public link.
        </p>
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-success bg-success/10 border border-success/30 rounded-sm px-3 py-2">
          Saved. Student can download it now.
        </p>
      )}

      <Button type="submit" disabled={isPending || uploading || !pdfUrl.trim()}>
        {isPending
          ? "Saving…"
          : existingUrl && pdfUrl === existingUrl
            ? "No changes"
            : existingUrl
              ? "Replace playbook"
              : "Save playbook"}
      </Button>
    </form>
  );
}
