"use server";

import { revalidatePath } from "next/cache";
import { USE_MOCK } from "./env";
import { getServerClient } from "./supabase/server";
import { generateFeedbackDraft } from "./ai-feedback";
import { getAdminSubmissionById } from "./data";

async function requireAdmin() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return { supabase, ok: false as const, error: "Admin only." };
  }
  return { supabase, ok: true as const, error: undefined };
}

interface SubmitFeedbackInput {
  submissionId: string;
  content: string;
  patterns: string[];
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function submitFeedbackAction(
  input: SubmitFeedbackInput,
): Promise<ActionResult> {
  const { submissionId, content, patterns } = input;

  if (!content.trim()) {
    return { ok: false, error: "Feedback content is required." };
  }

  if (USE_MOCK) {
    // Mock mode: just pretend it worked so the UI flow can be tested.
    await new Promise((r) => setTimeout(r, 400));
    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/admin/submissions");
    return { ok: true };
  }

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // RLS already requires is_admin for the insert; this check just gives a
  // clearer error than a generic Postgres permission denied.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return { ok: false, error: "Admin only." };
  }

  // Upsert: if feedback already exists for this submission, update it;
  // otherwise insert.
  const { data: existing } = await supabase
    .from("feedback")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("feedback")
      .update({
        content,
        patterns_identified: patterns,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("feedback").insert({
      submission_id: submissionId,
      content,
      patterns_identified: patterns,
    });
    if (error) return { ok: false, error: error.message };
    // The on_feedback_inserted trigger flips submission status to feedback_ready.
  }

  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── AI feedback draft ──────────────────────────────────────────────────────

interface DraftResult extends ActionResult {
  draft?: { content: string; patterns: string[] };
}

export async function generateFeedbackDraftAction(
  submissionId: string,
): Promise<DraftResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      ok: true,
      draft: {
        content:
          "**What I'm seeing:**\n\n[Mock draft] In live mode this will be a real Claude-generated draft based on the student's actual submission, exercise prompt, and your three-dimension framework.\n\n**The pattern:**\n\nMock mode shortcut.\n\n**What we'll do next:**\n\nSet ANTHROPIC_API_KEY in Vercel and switch off mock mode to enable real drafts.",
        patterns: ["translation lag", "hedging"],
      },
    };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const submission = await getAdminSubmissionById(submissionId);
  if (!submission) return { ok: false, error: "Submission not found." };
  if (!submission.exercise || !submission.exercise.id) {
    return { ok: false, error: "Submission is missing exercise context." };
  }

  try {
    const draft = await generateFeedbackDraft({
      studentFirstName:
        submission.student.first_name || submission.student.email,
      weekNumber: submission.exercise.week_number,
      moduleTitle: submission.module_title,
      exerciseTitle: submission.exercise.title,
      exercisePrompt: submission.exercise.prompt,
      submissionContent: submission.content,
      submissionAudioUrl: submission.audio_url ?? null,
    });
    return {
      ok: true,
      draft: { content: draft.content, patterns: draft.patterns_identified },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "AI draft failed.",
    };
  }
}

// ─── Pattern report admin ───────────────────────────────────────────────────

interface SavePatternReportInput {
  userId: string;
  type: "diagnostic_week1" | "summary_week6";
  content: string;
}

export async function savePatternReportAction(
  input: SavePatternReportInput,
): Promise<ActionResult> {
  if (!input.content.trim()) {
    return { ok: false, error: "Pattern report content is required." };
  }

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    revalidatePath(`/admin/students/${input.userId}`);
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { ok: true };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  // Upsert: one report per (user_id, type) due to the unique constraint.
  const { error } = await supabase.from("pattern_reports").upsert(
    {
      user_id: input.userId,
      type: input.type,
      content: input.content,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,type" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/students/${input.userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true };
}

// ─── Playbook admin ─────────────────────────────────────────────────────────

interface SavePlaybookInput {
  userId: string;
  pdfUrl: string;
}

export async function savePlaybookAction(
  input: SavePlaybookInput,
): Promise<ActionResult> {
  if (!input.pdfUrl.trim()) {
    return { ok: false, error: "PDF URL is required." };
  }

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    revalidatePath(`/admin/students/${input.userId}`);
    revalidatePath("/playbook");
    return { ok: true };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("playbooks").upsert(
    {
      user_id: input.userId,
      pdf_url: input.pdfUrl,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/students/${input.userId}`);
  revalidatePath("/playbook");
  return { ok: true };
}

// ─── Student profile update (current week, status) ──────────────────────────

interface UpdateStudentInput {
  userId: string;
  currentWeek?: number;
  status?: "active" | "completed" | "paused";
}

export async function updateStudentAction(
  input: UpdateStudentInput,
): Promise<ActionResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    revalidatePath(`/admin/students/${input.userId}`);
    revalidatePath("/admin");
    return { ok: true };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const update: Record<string, unknown> = {};
  if (typeof input.currentWeek === "number") update.current_week = input.currentWeek;
  if (input.status) update.status = input.status;
  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("user_id", input.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/students/${input.userId}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true };
}
