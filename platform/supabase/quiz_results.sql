-- ============================================================================
-- Get Client Ready — Quiz results table
-- Stores anonymous landing-page diagnostic quiz results so Bettina can
-- learn which patterns dominate her DACH market.
--
-- DELIBERATE DESIGN CHOICES:
-- - No email, no name, no IP — only the answer set + identified pattern.
-- - Anon role can INSERT only; SELECT is admin-only via RLS.
-- - User-agent recorded as a coarse spam signal, not for identification.
--
-- Run this in Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================================

create table if not exists public.quiz_results (
  id           bigserial primary key,
  breakdown    text,           -- 'lag' | 'structure' | 'shrink' | 'freeze'
  where_freeze text,           -- 'negotiation' | 'presentation' | 'call' | 'written'
  cost         text,           -- 'deals' | 'authority' | 'load' | 'confidence'
  silent       text,           -- 'less-smart' | 'outsider' | 'fraud' | 'dread'
  tried        text[] default '{}',  -- multi-select: 'ai', 'tutor', 'course', 'self', 'none'
  frequency    text,           -- 'often' | 'monthly' | 'yearly' | 'rare'
  goal         text,           -- 'close' | 'lead' | 'effort' | 'self'
  firstmove    text,           -- 'negotiate' | 'pushback' | 'unprep' | 'realtime'
  identity     text,           -- 'leader' | 'negotiator' | 'founder' | 'authority'
  user_agent   text,           -- coarse spam signal only
  created_at   timestamptz not null default now()
);

create index if not exists quiz_results_created_at_idx
  on public.quiz_results (created_at desc);

create index if not exists quiz_results_breakdown_idx
  on public.quiz_results (breakdown);

alter table public.quiz_results enable row level security;

-- Anyone (including unauthenticated visitors) can INSERT a quiz result.
drop policy if exists quiz_results_insert_anyone on public.quiz_results;
create policy quiz_results_insert_anyone on public.quiz_results
  for insert with check (true);

-- Only admins can read the rows.
drop policy if exists quiz_results_select_admin on public.quiz_results;
create policy quiz_results_select_admin on public.quiz_results
  for select using (public.is_admin());

-- Convenience view for Bettina's pattern analytics dashboards.
create or replace view public.quiz_pattern_summary as
  select
    breakdown,
    count(*)                    as total,
    count(*) filter (where created_at > now() - interval '7 days')  as last_7_days,
    count(*) filter (where created_at > now() - interval '30 days') as last_30_days
  from public.quiz_results
  where breakdown is not null
  group by breakdown
  order by total desc;
