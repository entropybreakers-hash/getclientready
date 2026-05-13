// Mock data layer — used when NEXT_PUBLIC_USE_MOCK=true.
// Mirrors the Supabase schema. Lets us preview the platform UI before
// Bettina connects the real database.

import type {
  Exercise,
  Feedback,
  Module,
  ModuleProgress,
  ModuleWithStatus,
  PatternReport,
  Playbook,
  Profile,
  Submission,
  SubmissionWithRelations,
} from "./types";

const USER_ID = "demo-user-1";

export const mockProfile: Profile = {
  user_id: USER_ID,
  email: "demo@getclientready.com",
  first_name: "Anna",
  last_name: "Mueller",
  tier: "shift",
  started_at: "2026-04-22",
  current_week: 3,
  status: "active",
  whatsapp: "+436641234567",
  is_admin: false,
};

export const mockModules: Module[] = [
  {
    id: "mod-1",
    week_number: 1,
    slug: "diagnose",
    title: "Diagnose",
    subtitle: "Find the exact pattern that's costing you authority.",
    description:
      "The platform runs your diagnostic. You complete real scenarios and the AI identifies your exact breakdown pattern.",
    content:
      "# Welcome to Week 1\n\nThis week you'll discover your specific breakdown pattern. Everyone freezes for a different reason — you'll find yours by Friday.",
    order: 1,
  },
  {
    id: "mod-2",
    week_number: 2,
    slug: "arm",
    title: "Arm",
    subtitle: "Twelve high-performance frameworks that hold under pressure.",
    description:
      "12 sentence frameworks drilled through interactive exercises calibrated to your diagnostic.",
    content:
      "# Week 2 — Arm\n\nThis week you'll install 12 sentence frameworks calibrated to your diagnostic. Each one is a tool you can reach for under pressure.",
    order: 2,
  },
  {
    id: "mod-3",
    week_number: 3,
    slug: "articulate",
    title: "Articulate",
    subtitle: "Rewrite the answers that didn't land the first time.",
    description:
      "Re-engineer your previous responses. Find where you shortened, hedged, or lost the thread.",
    content:
      "# Week 3 — Articulate\n\nThis week the platform shows you your own previous responses and helps you rewrite them — completely, powerfully — until nothing gets left on the table.",
    order: 3,
  },
  {
    id: "mod-4",
    week_number: 4,
    slug: "pressure-test",
    title: "Pressure-Test",
    subtitle: "Live AI simulations. The room pushes back. You hold ground.",
    description:
      "Live scenario simulations. The AI plays the client, the board member, the difficult negotiator.",
    content:
      "# Week 4 — Pressure-Test\n\nLive scenario simulations. The AI plays the difficult negotiator. You respond in real time. Feedback on every answer.",
    order: 4,
  },
  {
    id: "mod-5",
    week_number: 5,
    slug: "command",
    title: "Command",
    subtitle: "Steer, redirect, disagree — and close without hesitation.",
    description:
      "Proactive drills: how to steer, redirect, disagree with authority and close without hesitation.",
    content: "# Week 5 — Command\n\nProactive drills. Lead the conversation.",
    order: 5,
  },
  {
    id: "mod-6",
    week_number: 6,
    slug: "own-it",
    title: "Own It",
    subtitle: "Your personal playbook — generated from your own data.",
    description:
      "The platform generates your personal communication playbook from your six weeks of performance data.",
    content:
      "# Week 6 — Own It\n\nThe platform now has six weeks of your data. This is where it becomes yours.",
    order: 6,
  },
];

export const mockExercises: Exercise[] = [
  {
    id: "ex-1-1",
    module_id: "mod-1",
    module_slug: "diagnose",
    week_number: 1,
    title: "The freeze moment",
    prompt:
      "Write about the most recent time your English failed you in a high-stakes moment. What did you want to say? What came out? Aim for 300+ words — specifics matter more than polish.",
    type: "text",
    order: 1,
  },
  {
    id: "ex-1-2",
    module_id: "mod-1",
    module_slug: "diagnose",
    week_number: 1,
    title: "Translation lag self-test",
    prompt:
      "Read the three scenarios below. For each, record yourself responding in real time (no script, no pause). 2–3 minutes total.",
    type: "audio",
    order: 2,
  },
  {
    id: "ex-2-1",
    module_id: "mod-2",
    module_slug: "arm",
    week_number: 2,
    title: "Reframe the hedge",
    prompt:
      "Below are 6 hedged sentences from real DACH executives. Rewrite each in the high-performance form. Use the frameworks from this week's module.",
    type: "text",
    order: 1,
  },
  {
    id: "ex-3-1",
    module_id: "mod-3",
    module_slug: "articulate",
    week_number: 3,
    title: "Rewrite Exercise 1.1",
    prompt:
      "Open your submission from Week 1 — the freeze moment. Now rewrite it with the frameworks from Week 2. Same scenario, new version of you.",
    type: "text",
    order: 1,
  },
  {
    id: "ex-3-2",
    module_id: "mod-3",
    module_slug: "articulate",
    week_number: 3,
    title: "Three rewrites",
    prompt:
      "Pick three sentences from this week's reading where the speaker lost authority. Rewrite each one. Audio submission preferred.",
    type: "audio",
    order: 2,
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    user_id: USER_ID,
    exercise_id: "ex-1-1",
    content:
      "Last Wednesday I was on a call with our largest US client. They asked about timeline. I knew exactly what to say in German — 'Wir liefern das bis Freitag, garantiert.' Instead what came out was 'Maybe we can deliver this by Friday, but we need to see.' I watched their face change. They started leading the rest of the call.",
    audio_url: null,
    submitted_at: "2026-04-24T09:12:00Z",
    status: "feedback_ready",
  },
  {
    id: "sub-2",
    user_id: USER_ID,
    exercise_id: "ex-1-2",
    content: "[Audio submission — 2:34]",
    audio_url: "https://example.com/audio/sub-2.webm",
    submitted_at: "2026-04-26T14:30:00Z",
    status: "feedback_ready",
  },
  {
    id: "sub-3",
    user_id: USER_ID,
    exercise_id: "ex-2-1",
    content:
      "1. 'Maybe we should consider...' → 'I recommend we...'\n2. 'I find your proposal interesting' → 'This works.'\n3. 'Perhaps we could try' → 'Let's try.'\n4. 'I think it might be possible' → 'Yes — here's how.'\n5. 'It would be nice if' → 'I want.'\n6. 'I'm not sure but' → [delete entirely]",
    audio_url: null,
    submitted_at: "2026-05-02T16:45:00Z",
    status: "feedback_ready",
  },
  {
    id: "sub-4",
    user_id: USER_ID,
    exercise_id: "ex-3-1",
    content:
      "Same scenario, new answer: 'We deliver Friday. I'll send the milestone plan tonight so you can track it.' Notice — no maybe, no hedge, and I'm leading what happens next.",
    audio_url: null,
    submitted_at: "2026-05-11T11:20:00Z",
    status: "pending_review",
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: "fb-1",
    submission_id: "sub-1",
    content:
      "**What I'm seeing:**\n\nClassic translation lag plus hedge-stacking. You knew the strong sentence in German. The English version added three softeners ('Maybe', 'but', 'we need to see') that all signal uncertainty. Your client read that as 'they're unsure'.\n\n**The pattern:**\n\nThis is what we call Translation Lag combined with Identity Shift. In German you state. In English you ask permission. Both languages are yours — but right now, the English version of you carries less weight.\n\n**What we'll do in Week 2:**\n\nFramework #3 (Direct Commitment) and Framework #7 (Lead the Next Step) directly fix this. By next Wednesday you'll have automatic alternatives.",
    patterns_identified: ["translation lag", "hedging", "identity shift"],
    created_at: "2026-04-25T08:30:00Z",
  },
  {
    id: "fb-2",
    submission_id: "sub-2",
    content:
      "**Your real-time pattern:**\n\nClear translation lag in Scenario 2 — you paused 4.2 seconds before responding. That's the German→English conversion happening live.\n\nScenarios 1 and 3 were faster but you trailed off at the end ('...so I think we can manage'). That trailing softens the close.\n\n**Good news:** the lag is the biggest problem and it's the fastest to fix.",
    patterns_identified: ["translation lag", "trailing off"],
    created_at: "2026-04-27T10:00:00Z",
  },
  {
    id: "fb-3",
    submission_id: "sub-3",
    content:
      "Strong rewrites — especially #2 and #6. You're already feeling the difference.\n\nFor #5, 'I want' is correct but a little blunt in DACH context. Try: 'I'd like us to' — same directness, slightly more relational.",
    patterns_identified: ["framework integration"],
    created_at: "2026-05-03T09:15:00Z",
  },
];

export const mockProgress: ModuleProgress[] = [
  {
    module_id: "mod-1",
    completed_at: "2026-04-29T22:00:00Z",
    exercises_completed: 2,
    exercises_total: 2,
  },
  {
    module_id: "mod-2",
    completed_at: "2026-05-06T22:00:00Z",
    exercises_completed: 1,
    exercises_total: 1,
  },
  {
    module_id: "mod-3",
    completed_at: null,
    exercises_completed: 1,
    exercises_total: 2,
  },
];

export const mockPatternReport: PatternReport = {
  id: "pr-1",
  user_id: USER_ID,
  type: "diagnostic_week1",
  content:
    "**Your primary pattern:** Translation Lag\n\n**Secondary patterns:** Hedging on high-stakes commitments, Trailing off at the end of sentences.\n\n**Strongest signal:** When the client pushes back, you reach for a German structure and translate. The lag is 2–4 seconds — long enough to read as uncertainty in international rooms.\n\n**Where it costs you most:** Closing moments — when authority matters most.",
  generated_at: "2026-04-30T08:00:00Z",
};

export const mockPlaybook: Playbook | null = null;

export const mockModulesWithStatus = (): ModuleWithStatus[] => {
  return mockModules.map((m) => {
    const progress = mockProgress.find((p) => p.module_id === m.id) ?? null;
    let status: ModuleWithStatus["status"];
    if (m.week_number < mockProfile.current_week) {
      status = progress?.completed_at ? "completed" : "available";
    } else if (m.week_number === mockProfile.current_week) {
      status = "in_progress";
    } else {
      status = "locked";
    }
    return { ...m, status, progress };
  });
};

export const mockSubmissionsWithRelations =
  (): SubmissionWithRelations[] => {
    return mockSubmissions.map((s) => {
      const exercise = mockExercises.find((e) => e.id === s.exercise_id)!;
      const feedback = mockFeedback.find((f) => f.submission_id === s.id) ?? null;
      return { ...s, exercise, feedback };
    });
  };

// Admin-side: list of students for /admin
export const mockStudents: Profile[] = [
  mockProfile,
  {
    user_id: "demo-user-2",
    email: "stefan@example.com",
    first_name: "Stefan",
    last_name: "Berger",
    tier: "reframe",
    started_at: "2026-04-08",
    current_week: 5,
    status: "active",
    is_admin: false,
  },
  {
    user_id: "demo-user-3",
    email: "lukas@example.com",
    first_name: "Lukas",
    last_name: "Wagner",
    tier: "sprint",
    started_at: "2026-05-06",
    current_week: 1,
    status: "active",
    is_admin: false,
  },
];
