// Data access layer.
// Single entry point for all reads/writes. Switches between mock data
// (NEXT_PUBLIC_USE_MOCK=true) and live Supabase (when env vars are set).
//
// The page components only ever call this layer — they don't know
// whether the data came from a mock object or a Postgres table.

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
import type {
  Exercise,
  Feedback,
  ModuleWithStatus,
  PatternReport,
  Playbook,
  Profile,
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

  // Live Supabase path — implemented in Phase 2 when env vars are wired.
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (USE_MOCK) return mockProfile;
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getModulesWithStatus(): Promise<ModuleWithStatus[]> {
  if (USE_MOCK) return mockModulesWithStatus();
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getModuleBySlug(
  slug: string,
): Promise<ModuleWithStatus | null> {
  if (USE_MOCK) {
    return mockModulesWithStatus().find((m) => m.slug === slug) ?? null;
  }
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getExercisesByModule(
  moduleId: string,
): Promise<Exercise[]> {
  if (USE_MOCK) {
    return mockExercises.filter((e) => e.module_id === moduleId);
  }
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  if (USE_MOCK) return mockExercises.find((e) => e.id === id) ?? null;
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getSubmissionById(
  id: string,
): Promise<SubmissionWithRelations | null> {
  if (USE_MOCK) {
    return (
      mockSubmissionsWithRelations().find((s) => s.id === id) ?? null
    );
  }
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getMySubmissions(): Promise<SubmissionWithRelations[]> {
  if (USE_MOCK) return mockSubmissionsWithRelations();
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getMySubmissionsForExercise(
  exerciseId: string,
): Promise<SubmissionWithRelations[]> {
  if (USE_MOCK) {
    return mockSubmissionsWithRelations().filter(
      (s) => s.exercise_id === exerciseId,
    );
  }
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getMyPatternReport(): Promise<PatternReport | null> {
  if (USE_MOCK) return mockPatternReport;
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getMyPlaybook(): Promise<Playbook | null> {
  if (USE_MOCK) return mockPlaybook;
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

// Admin
export async function listStudents(): Promise<Profile[]> {
  if (USE_MOCK) return mockStudents;
  throw new Error("Supabase data layer not yet implemented for live mode.");
}

export async function getFeedbackForSubmission(
  submissionId: string,
): Promise<Feedback | null> {
  if (USE_MOCK) {
    return mockFeedback.find((f) => f.submission_id === submissionId) ?? null;
  }
  throw new Error("Supabase data layer not yet implemented for live mode.");
}
