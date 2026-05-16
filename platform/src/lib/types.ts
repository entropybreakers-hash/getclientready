// Domain types — shared between mock and Supabase data sources.

export type Tier = "sprint" | "shift" | "reframe";
export type ProfileStatus = "active" | "completed" | "paused";
export type ExerciseType = "text" | "audio" | "scenario";
export type SubmissionStatus = "pending_review" | "feedback_ready";
export type ModuleStatus = "locked" | "available" | "in_progress" | "completed";

export interface Profile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  tier: Tier;
  started_at: string;
  current_week: number;
  status: ProfileStatus;
  whatsapp?: string | null;
  is_admin?: boolean;
}

export interface Module {
  id: string;
  week_number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  order: number;
}

export interface Exercise {
  id: string;
  module_id: string;
  module_slug: string;
  week_number: number;
  title: string;
  prompt: string;
  type: ExerciseType;
  order: number;
}

export interface Submission {
  id: string;
  user_id: string;
  exercise_id: string;
  content: string;
  audio_url?: string | null;
  transcript?: string | null;
  submitted_at: string;
  status: SubmissionStatus;
}

export interface Feedback {
  id: string;
  submission_id: string;
  content: string;
  patterns_identified: string[];
  created_at: string;
}

export interface ModuleProgress {
  module_id: string;
  completed_at: string | null;
  exercises_completed: number;
  exercises_total: number;
}

export interface PatternReport {
  id: string;
  user_id: string;
  type: "diagnostic_week1" | "summary_week6";
  content: string;
  generated_at: string;
}

export interface Playbook {
  id: string;
  user_id: string;
  pdf_url: string;
  generated_at: string;
}

export interface ModuleWithStatus extends Module {
  status: ModuleStatus;
  progress: ModuleProgress | null;
}

export interface SubmissionWithRelations extends Submission {
  exercise: Exercise;
  feedback: Feedback | null;
}

export interface AdminSubmissionRow extends Submission {
  exercise: Exercise;
  student: Pick<Profile, "user_id" | "email" | "first_name" | "last_name" | "tier" | "current_week">;
  feedback: Feedback | null;
}
