// Audio transcription via OpenAI Whisper.
//
// Audio submissions are stored in a private Supabase Storage bucket and
// referenced by a long-lived signed URL. Claude cannot hear audio, so to
// draft feedback on a spoken exercise we first turn the recording into text
// here, then feed the transcript to the existing AI feedback drafter.

import "server-only";

import { OPENAI_API_KEY } from "./env";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

// Whisper detects the format from the filename extension. The recorder
// produces webm (most browsers) or m4a (Safari); fall back to webm.
function fileNameForUrl(url: string): string {
  const path = url.split("?")[0];
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return ["webm", "m4a", "mp4", "mp3", "wav", "ogg", "mpga"].includes(ext)
    ? `submission.${ext}`
    : "submission.webm";
}

// Transcribes the audio at `audioUrl` and returns the spoken text.
// Throws on a missing key or an API/network failure.
export async function transcribeAudioFromUrl(audioUrl: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables (server-only) to enable audio transcription.",
    );
  }

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    throw new Error(
      `Could not download the recording (HTTP ${audioRes.status}).`,
    );
  }
  const audioBlob = await audioRes.blob();

  const form = new FormData();
  form.append("file", audioBlob, fileNameForUrl(audioUrl));
  form.append("model", "whisper-1");
  // The exercises are English-performance training — pin the language so
  // accented English is not misdetected as another language.
  form.append("language", "en");

  const res = await fetch(WHISPER_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Transcription failed (HTTP ${res.status}). ${detail.slice(0, 300)}`,
    );
  }

  const json = (await res.json()) as { text?: string };
  const text = json.text?.trim() ?? "";
  if (!text) {
    throw new Error("Transcription returned no text — the recording may be silent.");
  }
  return text;
}
