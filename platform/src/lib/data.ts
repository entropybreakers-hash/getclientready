// Data access layer.
// Single entry point for all reads/writes. Switches between mock data
// (NEXT_PUBLIC_USE_MOCK=true) and live Supabase when env vars are set.
//
// The page components only ever call this layer — they don't know
// whether the data came from a mock object or a Postgres table.

import "server-only";

import { USE_MOCK } from "./env";
import {
  mockExercises,
  mockFeedback,
  mockModulesWithStatus,
  mockPatternReport,
  mockPlaybook,
  mockProfile,
  mockStudents,
  mockSubmissionsWithRelations,
} from "./mock";
import { getServerClient } from "./supabase/server";
import type {
  AdminSubmissionRow,
  Exercise,
  Feedback,
  Module,
  ModuleProgress,
  ModuleStatus,
  ModuleWithStatus,
  PatternReport,
  Playbook,
  Profile,
  Submission,
  SubmissionWithRelations,
} from "./types";

export interface DashboardData {
  profile: Profile;
  currentModule: ModuleWithStatus;
  modules: ModuleWithStatus[];
  recentFeedback: Array<{
    feedback: Feedback;
    submission: SubmissionWithRelations;
  }>;
  patternReport: PatternReport | null;
  exercisesCompleted: number;
  exercisesTotal: number;
}

// ─── helpers (live mode) ────────────────────────────────────────────────────

function computeStatus(
  weekNumber: number,
  currentWeek: number,
  completedAt: string | null,
): ModuleStatus {
  if (weekNumber > currentWeek) return "locked";
  if (weekNumber < currentWeek) return completedAt ? "completed" : "available";
  return "in_progress";
}

interface ModuleRow {
  id: string;
  week_number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  order: number;
}

interface ExerciseRow {
  id: string;
  module_id: string;
  title: string;
  prompt: string;
  type: Exercise["type"];
  order: number;
  modules?: { slug: string; week_number: number } | null;
}

interface SubmissionRow {
  id: string;
  user_id: string;
  exercise_id: string;
  content: string;
  audio_url: string | null;
  submitted_at: string;
  status: Submission["status"];
}

interface FeedbackRow {
  id: string;
  submission_id: string;
  content: string;
  patterns_identified: string[];
  created_at: string;
}

interface ProgressRow {
  module_id: string;
  completed_at: string | null;
  exercises_completed: number;
  exercises_total: number;
}

function moduleFromRow(row: ModuleRow): Module {
  return {
    id: row.id,
    week_number: row.week_number,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    content: row.content,
    order: row.order,
  };
}

function exerciseFromRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    module_id: row.module_id,
    module_slug: row.modules?.slug ?? "",
    week_number: row.modules?.week_number ?? 0,
    title: row.title,
    prompt: row.prompt,
    type: row.type,
    order: row.order,
  };
}

function submissionFromRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    user_id: row.user_id,
    exercise_id: row.exercise_id,
    content: row.content,
    audio_url: row.audio_url,
    submitted_at: row.submitted_at,
    status: row.status,
  };
}

function progressFromRow(row: ProgressRow): ModuleProgress {
  return {
    module_id: row.module_id,
    completed_at: row.completed_at,
    exercises_completed: row.exercises_completed,
    exercises_total: row.exercises_total,
  };
}

// ─── live helpers ───────────────────────────────────────────────────────────

async function liveCurrentProfile(): Promise<Profile | null> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data as Profile;
}

async function liveModulesWithStatus(): Promise<ModuleWithStatus[]> {
  const supabase = await getServerClient();
  const profile = await liveCurrentProfile();
  const currentWeek = profile?.current_week ?? 1;

  const { data: modulesData, error: modErr } = await supabase
    .from("modules")
    .select("*")
    .order("order", { ascending: true });
  if (modErr) throw modErr;
  const modules = (modulesData ?? []) as ModuleRow[];

  let progressByModule = new Map<string, ProgressRow>();
  if (profile) {
    const { data: progressData, error: progErr } = await supabase
      .from("progress")
      .select("module_id, completed_at, exercises_completed, exercises_total")
      .eq("user_id", profile.user_id);
    if (progErr) throw progErr;
    progressByModule = new Map(
      (progressData ?? []).map((p) => [(p as ProgressRow).module_id, p as ProgressRow]),
    );
  }

  return modules.map((m) => {
    const progressRow = progressByModule.get(m.id) ?? null;
    const progress = progressRow ? progressFromRow(progressRow) : null;
    return {
      ...moduleFromRow(m),
      progress,
      status: computeStatus(m.week_number, currentWeek, progress?.completed_at ?? null),
    };
  });
}

async function liveMySubmissionsWithRelations(
  exerciseId?: string,
): Promise<SubmissionWithRelations[]> {
  const supabase = await getServerClient();
  const profile = await liveCurrentProfile();
  if (!profile) return [];

  let query = supabase
    .from("submissions")
    .select(
      `*,
       exercise:exercises (
         id, module_id, title, prompt, type, "order",
         modules ( slug, week_number )
       ),
       feedback ( * )`,
    )
    .eq("user_id", profile.user_id)
    .order("submitted_at", { ascending: false });

  if (exerciseId) query = query.eq("exercise_id", exerciseId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    // Supabase returns nested rows; types are loose because of the embed.
    const r = row as SubmissionRow & {
      exercise: ExerciseRow | null;
      feedback: FeedbackRow[] | FeedbackRow | null;
    };
    const fb = Array.isArray(r.feedback) ? r.feedback[0] : r.feedback;
    return {
      ...submissionFromRow(r),
      exercise: r.exercise ? exerciseFromRow(r.exercise) : ({} as Exercise),
      feedback: fb ? (fb as Feedback) : null,
    };
  });
}

// ─── public API ─────────────────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<Profile | null> {
  if (USE_MOCK) return mockProfile;
  return liveCurrentProfile();
}

export async function getModulesWithStatus(): Promise<ModuleWithStatus[]> {
  if (USE_MOCK) return mockModulesWithStatus();
  return liveModulesWithStatus();
}

export async function getModuleBySlug(
  slug: string,
): Promise<ModuleWithStatus | null> {
  if (USE_MOCK) {
    return mockModulesWithStatus().find((m) => m.slug === slug) ?? null;
  }
  const all = await liveModulesWithStatus();
  return all.find((m) => m.slug === slug) ?? null;
}

export async function getExercisesByModule(
  moduleId: string,
): Promise<Exercise[]> {
  if (USE_MOCK) {
    return mockExercises.filter((e) => e.module_id === moduleId);
  }
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(`*, modules ( slug, week_number )`)
    .eq("module_id", moduleId)
    .order("order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ExerciseRow[]).map(exerciseFromRow);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  if (USE_MOCK) return mockExercises.find((e) => e.id === id) ?? null;
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(`*, modules ( slug, week_number )`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? exerciseFromRow(data as ExerciseRow) : null;
}

export async function getSubmissionById(
  id: string,
): Promise<SubmissionWithRelations | null> {
  if (USE_MOCK) {
    return mockSubmissionsWithRelations().find((s) => s.id === id) ?? null;
  }
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `*,
       exercise:exercises (
         id, module_id, title, prompt, type, "order",
         modules ( slug, week_number )
       ),
       feedback ( * )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = data as SubmissionRow & {
    exercise: ExerciseRow | null;
    feedback: FeedbackRow[] | FeedbackRow | null;
  };
  const fb = Array.isArray(r.feedback) ? r.feedback[0] : r.feedback;
  return {
    ...submissionFromRow(r),
    exercise: r.exercise ? exerciseFromRow(r.exercise) : ({} as Exercise),
    feedback: fb ? (fb as Feedback) : null,
  };
}

export async function getMySubmissions(): Promise<SubmissionWithRelations[]> {
  if (USE_MOCK) return mockSubmissionsWithRelations();
  return liveMySubmissionsWithRelations();
}

export async function getMySubmissionsForExercise(
  exerciseId: string,
): Promise<SubmissionWithRelations[]> {
  if (USE_MOCK) {
    return mockSubmissionsWithRelations().filter(
      (s) => s.exercise_id === exerciseId,
    );
  }
  return liveMySubmissionsWithRelations(exerciseId);
}

export async function getMyPatternReport(): Promise<PatternReport | null> {
  if (USE_MOCK) return mockPatternReport;
  const supabase = await getServerClient();
  const profile = await liveCurrentProfile();
  if (!profile) return null;
  const { data, error } = await supabase
    .from("pattern_reports")
    .select("*")
    .eq("user_id", profile.user_id)
    .eq("type", "diagnostic_week1")
    .maybeSingle();
  if (error) throw error;
  return data ? (data as PatternReport) : null;
}

export async function getMyPlaybook(): Promise<Playbook | null> {
  if (USE_MOCK) return mockPlaybook;
  const supabase = await getServerClient();
  const profile = await liveCurrentProfile();
  if (!profile) return null;
  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .eq("user_id", profile.user_id)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as Playbook) : null;
}

// ─── dashboard composition ──────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  if (USE_MOCK) {
    const modules = mockModulesWithStatus();
    const currentModule =
      modules.find((m) => m.week_number === mockProfile.current_week) ??
      modules[0];
    const subs = mockSubmissionsWithRelations();
    const recentFeedback = subs
      .filter((s) => s.feedback)
      .sort(
        (a, b) =>
          new Date(b.feedback!.created_at).getTime() -
          new Date(a.feedback!.created_at).getTime(),
      )
      .slice(0, 3)
      .map((s) => ({ feedback: s.feedback!, submission: s }));
    const exercisesCompleted = subs.filter(
      (s) => s.status === "feedback_ready",
    ).length;
    const exercisesTotal = mockExercises.length;
    return {
      profile: mockProfile,
      currentModule,
      modules,
      recentFeedback,
      patternReport: mockPatternReport,
      exercisesCompleted,
      exercisesTotal,
    };
  }

  const profile = await liveCurrentProfile();
  if (!profile) throw new Error("No profile for current user");
  const supabase = await getServerClient();

  const [modules, subs, pattern, exTotalRes] = await Promise.all([
    liveModulesWithStatus(),
    liveMySubmissionsWithRelations(),
    getMyPatternReport(),
    supabase.from("exercises").select("id", { count: "exact", head: true }),
  ]);

  const currentModule =
    modules.find((m) => m.week_number === profile.current_week) ?? modules[0];
  const recentFeedback = subs
    .filter((s) => s.feedback)
    .slice(0, 3)
    .map((s) => ({ feedback: s.feedback!, submission: s }));
  const exercisesCompleted = subs.filter(
    (s) => s.status === "feedback_ready",
  ).length;

  return {
    profile,
    currentModule,
    modules,
    recentFeedback,
    patternReport: pattern,
    exercisesCompleted,
    exercisesTotal: exTotalRes.count ?? 0,
  };
}

// ─── admin ──────────────────────────────────────────────────────────────────

export async function listStudents(): Promise<Profile[]> {
  if (USE_MOCK) return mockStudents;
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export interface AdminSubmissionListItem extends AdminSubmissionRow {
  module_title: string;
}

export async function listSubmissionsForAdmin(options?: {
  status?: "pending_review" | "feedback_ready" | "all";
  limit?: number;
}): Promise<AdminSubmissionListItem[]> {
  const status = options?.status ?? "pending_review";
  const limit = options?.limit ?? 100;

  if (USE_MOCK) {
    const subs = mockSubmissionsWithRelations();
    const filtered = status === "all" ? subs : subs.filter((s) => s.status === status);
    return filtered.slice(0, limit).map((s) => ({
      ...s,
      student: {
        user_id: mockProfile.user_id,
        email: mockProfile.email,
        first_name: mockProfile.first_name,
        last_name: mockProfile.last_name,
        tier: mockProfile.tier,
        current_week: mockProfile.current_week,
      },
      module_title:
        mockModulesWithStatus().find((m) => m.id === s.exercise.module_id)?.title ?? "",
    }));
  }

  const supabase = await getServerClient();
  let query = supabase
    .from("submissions")
    .select(
      `*,
       exercise:exercises (
         id, module_id, title, prompt, type, "order",
         modules ( id, slug, title, week_number )
       ),
       student:profiles!submissions_user_id_fkey (
         user_id, email, first_name, last_name, tier, current_week
       ),
       feedback ( * )`,
    )
    .order("submitted_at", { ascending: true })
    .limit(limit);

  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as SubmissionRow & {
      exercise: (ExerciseRow & { modules: { id: string; slug: string; title: string; week_number: number } | null }) | null;
      student: AdminSubmissionRow["student"] | null;
      feedback: FeedbackRow[] | FeedbackRow | null;
    };
    const fb = Array.isArray(r.feedback) ? r.feedback[0] : r.feedback;
    return {
      ...submissionFromRow(r),
      exercise: r.exercise ? exerciseFromRow(r.exercise) : ({} as Exercise),
      student: r.student ?? ({} as AdminSubmissionRow["student"]),
      feedback: fb ? (fb as Feedback) : null,
      module_title: r.exercise?.modules?.title ?? "",
    };
  });
}

export async function getAdminSubmissionById(
  id: string,
): Promise<AdminSubmissionListItem | null> {
  if (USE_MOCK) {
    const all = await listSubmissionsForAdmin({ status: "all" });
    return all.find((s) => s.id === id) ?? null;
  }
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `*,
       exercise:exercises (
         id, module_id, title, prompt, type, "order",
         modules ( id, slug, title, week_number )
       ),
       student:profiles!submissions_user_id_fkey (
         user_id, email, first_name, last_name, tier, current_week
       ),
       feedback ( * )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = data as SubmissionRow & {
    exercise: (ExerciseRow & { modules: { id: string; slug: string; title: string; week_number: number } | null }) | null;
    student: AdminSubmissionRow["student"] | null;
    feedback: FeedbackRow[] | FeedbackRow | null;
  };
  const fb = Array.isArray(r.feedback) ? r.feedback[0] : r.feedback;
  return {
    ...submissionFromRow(r),
    exercise: r.exercise ? exerciseFromRow(r.exercise) : ({} as Exercise),
    student: r.student ?? ({} as AdminSubmissionRow["student"]),
    feedback: fb ? (fb as Feedback) : null,
    module_title: r.exercise?.modules?.title ?? "",
  };
}

export async function getFeedbackForSubmission(
  submissionId: string,
): Promise<Feedback | null> {
  if (USE_MOCK) {
    return mockFeedback.find((f) => f.submission_id === submissionId) ?? null;
  }
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as Feedback) : null;
}
