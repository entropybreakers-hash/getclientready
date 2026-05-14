"use server";

import { revalidatePath } from "next/cache";
import { USE_MOCK } from "./env";
import { getServerClient } from "./supabase/server";
import {
  generateFeedbackDraft,
  generatePatternReportDraft,
  generatePlaybookDraft,
} from "./ai-feedback";
import {
  getAdminSubmissionById,
  getStudentPatternReports,
  listSubmissionsForAdmin,
  getStudentById,
} from "./data";
import { sendFeedbackReadyEmail, sendWelcomeEmail } from "./email";

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

  const isNewFeedback = !existing;
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

  // Notify the student via email — only on NEW feedback, not on edits, so
  // re-saving doesn't spam them. Soft-fail: never break the Save button.
  if (isNewFeedback) {
    const submission = await getAdminSubmissionById(submissionId);
    if (submission?.student?.email) {
      await sendFeedbackReadyEmail({
        to: submission.student.email,
        studentFirstName:
          submission.student.first_name || submission.student.email,
        exerciseTitle: submission.exercise.title,
        weekNumber: submission.exercise.week_number,
        submissionId,
      }).catch(() => undefined);
    }
  }

  // After feedback lands, check whether the student has now received feedback
  // on every exercise in the corresponding week. If so AND that week matches
  // their current_week, bump current_week to the next one. Capped at 6.
  await maybeAdvanceStudentWeek(supabase, submissionId);

  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
  return { ok: true };
}

async function maybeAdvanceStudentWeek(
  supabase: Awaited<ReturnType<typeof getServerClient>>,
  submissionId: string,
): Promise<void> {
  // Look up the submission's student + which week its exercise belongs to.
  const { data: subData } = await supabase
    .from("submissions")
    .select("user_id, exercise:exercises ( module:modules ( week_number ) )")
    .eq("id", submissionId)
    .maybeSingle();
  const sub = subData as
    | {
        user_id: string;
        exercise: { module: { week_number: number } | null } | null;
      }
    | null;
  if (!sub?.exercise?.module) return;
  const weekNumber = sub.exercise.module.week_number;
  const userId = sub.user_id;

  // Only act when this submission's week IS the student's current_week.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("current_week")
    .eq("user_id", userId)
    .maybeSingle();
  const currentWeek = (profileRow as { current_week: number } | null)?.current_week;
  if (!currentWeek || currentWeek !== weekNumber || currentWeek >= 6) return;

  // All exercises for this week.
  const { data: weekExercises } = await supabase
    .from("exercises")
    .select("id, module:modules!inner ( week_number )")
    .eq("modules.week_number", weekNumber);
  const exerciseIds = (
    (weekExercises ?? []) as Array<{ id: string }>
  ).map((e) => e.id);
  if (exerciseIds.length === 0) return;

  // All this student's feedback_ready submissions in this week.
  const { data: readySubs } = await supabase
    .from("submissions")
    .select("exercise_id")
    .eq("user_id", userId)
    .eq("status", "feedback_ready")
    .in("exercise_id", exerciseIds);
  const coveredExerciseIds = new Set(
    ((readySubs ?? []) as Array<{ exercise_id: string }>).map(
      (s) => s.exercise_id,
    ),
  );
  const allCovered = exerciseIds.every((id) => coveredExerciseIds.has(id));
  if (!allCovered) return;

  // Advance.
  await supabase
    .from("profiles")
    .update({ current_week: currentWeek + 1 })
    .eq("user_id", userId);
  revalidatePath("/dashboard");
  revalidatePath(`/admin/students/${userId}`);
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

interface PatternReportDraftResult extends ActionResult {
  draft?: { content: string; patterns: string[] };
}

export async function generatePatternReportDraftAction(
  userId: string,
  type: "diagnostic_week1" | "summary_week6",
): Promise<PatternReportDraftResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      ok: true,
      draft: {
        content: `**Your primary pattern:** [Mock draft] Translation Lag with permission-seeking overlay.\n\n**Secondary patterns:** Hedging, structure trap on prepositions.\n\n**Strongest signal:** Mock mode shortcut.\n\n**Where it costs you most:** Mock placeholder.\n\n**What we'll do in the next five weeks:** Set ANTHROPIC_API_KEY in Vercel to get a real draft.`,
        patterns: ["translation lag", "hedging"],
      },
    };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const student = await getStudentById(userId);
  if (!student) return { ok: false, error: "Student not found." };

  // Pull the relevant submissions.
  const weekFilter =
    type === "diagnostic_week1" ? 1 : null; // null means all weeks
  const allSubs = await listSubmissionsForAdmin({
    status: "all",
    limit: 200,
  });
  const studentSubs = allSubs
    .filter((s) => s.user_id === userId)
    .filter((s) =>
      weekFilter === null ? true : s.exercise.week_number === weekFilter,
    )
    .sort(
      (a, b) =>
        a.exercise.week_number - b.exercise.week_number ||
        a.exercise.order - b.exercise.order,
    );

  if (studentSubs.length === 0) {
    return {
      ok: false,
      error:
        type === "diagnostic_week1"
          ? "No Week 1 submissions yet for this student."
          : "No submissions yet for this student.",
    };
  }

  try {
    const draft = await generatePatternReportDraft({
      studentFirstName: student.first_name || student.email,
      type,
      submissions: studentSubs.map((s) => ({
        weekNumber: s.exercise.week_number,
        exerciseTitle: s.exercise.title,
        prompt: s.exercise.prompt,
        studentContent: s.audio_url
          ? `[Audio submission] ${s.content}`
          : s.content,
        feedback: s.feedback?.content ?? null,
      })),
    });
    return {
      ok: true,
      draft: {
        content: draft.content,
        patterns: draft.patterns_identified,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "AI draft failed.",
    };
  }
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

interface PlaybookDraftResult extends ActionResult {
  draft?: { content: string; patterns: string[] };
}

export async function generatePlaybookDraftAction(
  userId: string,
): Promise<PlaybookDraftResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2500));
    return {
      ok: true,
      draft: {
        content: `*[Mock draft]*\n\n*The arc you just completed.*\n\n## 1. Your Pattern Signature\n\n[Mock draft] In live mode this will be a real Claude-generated playbook drawn from all six weeks of the student's submissions and feedback. Each of the seven sections is filled with their actual words and your actual coaching.\n\n## 2. Your Trap Replacements\n\n| Trap | Your replacement | Where you nailed it |\n|---|---|---|\n| — | — | — |\n\n## 3. Your Authority Rewrites\n\n— mock —\n\n## 4. Your Pressure Frameworks\n\n— mock —\n\n## 5. Your Command Library\n\n— mock —\n\n## 6. Your Signature Frameworks\n\n— mock —\n\n## 7. Your Next 90 Days\n\nSet \`ANTHROPIC_API_KEY\` in Vercel and switch off mock mode to generate a real playbook.`,
        patterns: ["translation lag", "hedging", "framework integration"],
      },
    };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const student = await getStudentById(userId);
  if (!student) return { ok: false, error: "Student not found." };

  const [allSubs, patternReports] = await Promise.all([
    listSubmissionsForAdmin({ status: "all", limit: 200 }),
    getStudentPatternReports(userId),
  ]);
  const studentSubs = allSubs
    .filter((s) => s.user_id === userId)
    .sort(
      (a, b) =>
        a.exercise.week_number - b.exercise.week_number ||
        a.exercise.order - b.exercise.order,
    );

  if (studentSubs.length === 0) {
    return { ok: false, error: "No submissions yet for this student." };
  }

  const week1Report =
    patternReports.find((r) => r.type === "diagnostic_week1")?.content ?? null;

  try {
    const draft = await generatePlaybookDraft({
      studentFirstName: student.first_name || student.email,
      startedAt: student.started_at,
      week1PatternReport: week1Report,
      submissions: studentSubs.map((s) => ({
        weekNumber: s.exercise.week_number,
        exerciseTitle: s.exercise.title,
        prompt: s.exercise.prompt,
        studentContent: s.audio_url
          ? `[Audio submission] ${s.content}`
          : s.content,
        feedback: s.feedback?.content ?? null,
      })),
    });
    return {
      ok: true,
      draft: {
        content: draft.content,
        patterns: draft.patterns_resolved,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "AI draft failed.",
    };
  }
}

// ─── Welcome email ──────────────────────────────────────────────────────────

interface SendWelcomeEmailInput {
  userId: string;
  tempPassword?: string;
}

export async function sendWelcomeEmailAction(
  input: SendWelcomeEmailInput,
): Promise<ActionResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const student = await getStudentById(input.userId);
  if (!student) return { ok: false, error: "Student not found." };

  const res = await sendWelcomeEmail({
    to: student.email,
    studentFirstName: student.first_name || student.email.split("@")[0],
    tempPassword: input.tempPassword?.trim() || null,
  });

  if (res.skipped) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY not set in Vercel env vars. Add it to send transactional email.",
    };
  }
  if (!res.ok) return { ok: false, error: res.error ?? "Send failed." };
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
