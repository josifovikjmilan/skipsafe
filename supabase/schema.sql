-- SkipSafe database setup.
-- Paste this whole file in Supabase: SQL Editor -> New query -> Run.
-- It is safe to run more than once.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  total_sessions integer not null default 30 check (total_sessions between 1 and 200),
  absences integer not null default 0 check (absences >= 0 and absences <= total_sessions),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on public.courses (user_id);

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- Row Level Security: every user only reaches their own rows.
alter table public.courses enable row level security;

drop policy if exists "courses_select_own" on public.courses;
drop policy if exists "courses_insert_own" on public.courses;
drop policy if exists "courses_update_own" on public.courses;
drop policy if exists "courses_delete_own" on public.courses;

create policy "courses_select_own" on public.courses
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "courses_insert_own" on public.courses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "courses_update_own" on public.courses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "courses_delete_own" on public.courses
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Logged out visitors (the anon role) get no access at all.
-- Logged in users get table access, and RLS above limits them to their own rows.
revoke all on public.courses from anon, authenticated;
grant select, insert, update, delete on public.courses to authenticated;

-- Tell the API to pick up the new table right away.
notify pgrst, 'reload schema';
