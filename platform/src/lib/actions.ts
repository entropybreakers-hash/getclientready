"use server";

import { revalidatePath } from "next/cache";
import { USE_MOCK } from "./env";
import { getServerClient } from "./supabase/server";

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
