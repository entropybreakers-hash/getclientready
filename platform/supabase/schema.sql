-- ============================================================================
-- Get Client Ready — Student Platform
-- Supabase schema + RLS policies (V1, Wizard of Oz)
-- ============================================================================
-- HOW TO RUN:
--   1. Open Supabase Dashboard → SQL Editor → New query
--   2. Paste this whole file
--   3. Click "Run"
--   4. Seed the 6 module rows separately (see seed.sql)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES — one row per Auth user, extends `auth.users`.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  first_name   text not null default '',
  last_name    text not null default '',
  tier         text not null default 'sprint'
               check (tier in ('sprint', 'shift', 'reframe')),
  started_at   date not null default current_date,
  current_week int  not null default 1 check (current_week between 1 and 6),
  status       text not null default 'active'
               check (status in ('active', 'completed', 'paused')),
  whatsapp     text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create a profile row when a new auth.users row is inserted.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, first_name, last_name)
  values (new.id,
          new.email,
          coalesce(new.raw_user_meta_data->>'first_name', ''),
          coalesce(new.raw_user_meta_data->>'last_name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULES — the 6 weekly modules (Bettina seeds content here).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.modules (
  id           uuid primary key default gen_random_uuid(),
  week_number  int  not null unique check (week_number between 1 and 6),
  slug         text not null unique,
  title        text not null,
  subtitle     text not null default '',
  description  text not null default '',
  content      text not null default '',
  "order"      int  not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- EXERCISES — many per module.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.exercises (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  title        text not null,
  prompt       text not null default '',
  type         text not null default 'text'
               check (type in ('text', 'audio', 'scenario')),
  "order"      int  not null default 1,
  created_at   timestamptz not null default now()
);
create index if not exists exercises_module_idx on public.exercises (module_id, "order");

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBMISSIONS — student work for an exercise.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  content       text not null default '',
  audio_url     text,
  transcript    text,
  status        text not null default 'pending_review'
                check (status in ('pending_review', 'feedback_ready')),
  submitted_at  timestamptz not null default now()
);
-- Backfill the transcript column on databases created before it existed.
alter table public.submissions add column if not exists transcript text;
create index if not exists submissions_user_idx on public.submissions (user_id, submitted_at desc);
create index if not exists submissions_status_idx on public.submissions (status);

-- ─────────────────────────────────────────────────────────────────────────────
-- FEEDBACK — Bettina's response to a submission.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.feedback (
  id                  uuid primary key default gen_random_uuid(),
  submission_id       uuid not null unique references public.submissions(id) on delete cascade,
  content             text not null,
  patterns_identified text[] not null default '{}',
  created_at          timestamptz not null default now()
);

-- When feedback is created, automatically flip the submission status.
create or replace function public.handle_feedback_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.submissions set status = 'feedback_ready' where id = new.submission_id;
  return new;
end;
$$;

drop trigger if exists on_feedback_inserted on public.feedback;
create trigger on_feedback_inserted
  after insert on public.feedback
  for each row execute procedure public.handle_feedback_insert();

-- ─────────────────────────────────────────────────────────────────────────────
-- PROGRESS — per-user, per-module tracking.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id              uuid not null references auth.users(id) on delete cascade,
  module_id            uuid not null references public.modules(id) on delete cascade,
  completed_at         timestamptz,
  exercises_completed  int not null default 0,
  exercises_total      int not null default 0,
  updated_at           timestamptz not null default now(),
  primary key (user_id, module_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PATTERN REPORTS — generated by Bettina at Week 1 and Week 6.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.pattern_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('diagnostic_week1', 'summary_week6')),
  content      text not null,
  generated_at timestamptz not null default now(),
  unique (user_id, type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAYBOOKS — Week 6 PDF deliverable (one per user).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.playbooks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  pdf_url      text not null,
  generated_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles        enable row level security;
alter table public.modules         enable row level security;
alter table public.exercises       enable row level security;
alter table public.submissions     enable row level security;
alter table public.feedback        enable row level security;
alter table public.progress        enable row level security;
alter table public.pattern_reports enable row level security;
alter table public.playbooks       enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

-- ───── PROFILES ─────
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── MODULES (everyone signed-in reads them) ─────
drop policy if exists modules_select_all on public.modules;
create policy modules_select_all on public.modules
  for select using (auth.uid() is not null);

drop policy if exists modules_admin_all on public.modules;
create policy modules_admin_all on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── EXERCISES (same as modules) ─────
drop policy if exists exercises_select_all on public.exercises;
create policy exercises_select_all on public.exercises
  for select using (auth.uid() is not null);

drop policy if exists exercises_admin_all on public.exercises;
create policy exercises_admin_all on public.exercises
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── SUBMISSIONS ─────
drop policy if exists submissions_select_self on public.submissions;
create policy submissions_select_self on public.submissions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists submissions_insert_self on public.submissions;
create policy submissions_insert_self on public.submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists submissions_update_self on public.submissions;
create policy submissions_update_self on public.submissions
  for update using (
    (auth.uid() = user_id and status = 'pending_review') or public.is_admin()
  );

-- ───── FEEDBACK (read-only for students, write by admin) ─────
drop policy if exists feedback_select_owner on public.feedback;
create policy feedback_select_owner on public.feedback
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.submissions s
      where s.id = feedback.submission_id and s.user_id = auth.uid()
    )
  );

drop policy if exists feedback_admin_write on public.feedback;
create policy feedback_admin_write on public.feedback
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── PROGRESS ─────
drop policy if exists progress_select_self on public.progress;
create policy progress_select_self on public.progress
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists progress_admin_write on public.progress;
create policy progress_admin_write on public.progress
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── PATTERN REPORTS ─────
drop policy if exists pattern_reports_select_self on public.pattern_reports;
create policy pattern_reports_select_self on public.pattern_reports
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists pattern_reports_admin_write on public.pattern_reports;
create policy pattern_reports_admin_write on public.pattern_reports
  for all using (public.is_admin()) with check (public.is_admin());

-- ───── PLAYBOOKS ─────
drop policy if exists playbooks_select_self on public.playbooks;
create policy playbooks_select_self on public.playbooks
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists playbooks_admin_write on public.playbooks;
create policy playbooks_admin_write on public.playbooks
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Create buckets in the Supabase Dashboard → Storage:
--   1. "audio-submissions" — private, max 5 MB per file, .webm/.mp3/.m4a
--   2. "playbooks" — private, PDF only
-- Then the platform code accesses them with signed URLs.
