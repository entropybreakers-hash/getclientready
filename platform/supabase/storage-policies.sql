-- ============================================================================
-- Get Client Ready — Storage RLS policies
-- ============================================================================
-- Run AFTER you've created these private buckets in Supabase Dashboard
-- → Storage → New bucket:
--
--   1. audio-submissions  (private, files: .webm / .mp4 / .ogg, ~10 MB max)
--   2. playbooks          (private, files: .pdf, ~10 MB max)
--
-- These policies do two things:
--  • students can upload + read THEIR OWN files only (folder convention is
--    `{user_id}/...`)
--  • admins can read + write everything in both buckets
--
-- Note: signed URLs (createSignedUrl) bypass RLS for whoever holds the URL,
-- which is the whole point — we generate a long-lived signed URL on upload
-- and store it in the submission/playbook row.
-- ============================================================================

-- Helper: extract the first path segment as text. Used to enforce that
-- the user's UUID is the top-level folder.
create or replace function public.storage_first_folder(path text)
returns text language sql immutable as $$
  select split_part(path, '/', 1);
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- audio-submissions bucket
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists audio_submissions_student_insert on storage.objects;
create policy audio_submissions_student_insert on storage.objects
  for insert with check (
    bucket_id = 'audio-submissions'
    and auth.uid()::text = public.storage_first_folder(name)
  );

drop policy if exists audio_submissions_student_select on storage.objects;
create policy audio_submissions_student_select on storage.objects
  for select using (
    bucket_id = 'audio-submissions'
    and (
      auth.uid()::text = public.storage_first_folder(name)
      or public.is_admin()
    )
  );

drop policy if exists audio_submissions_admin_all on storage.objects;
create policy audio_submissions_admin_all on storage.objects
  for all using (
    bucket_id = 'audio-submissions' and public.is_admin()
  ) with check (
    bucket_id = 'audio-submissions' and public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- playbooks bucket
-- ─────────────────────────────────────────────────────────────────────────────
-- Only admin uploads; students can read their own folder (`{user_id}/*`).

drop policy if exists playbooks_admin_all on storage.objects;
create policy playbooks_admin_all on storage.objects
  for all using (
    bucket_id = 'playbooks' and public.is_admin()
  ) with check (
    bucket_id = 'playbooks' and public.is_admin()
  );

drop policy if exists playbooks_student_select on storage.objects;
create policy playbooks_student_select on storage.objects
  for select using (
    bucket_id = 'playbooks'
    and auth.uid()::text = public.storage_first_folder(name)
  );
