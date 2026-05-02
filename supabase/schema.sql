-- =========================================================================
-- Choreo schema
-- Run this once in your Supabase project's SQL editor.
-- Re-runnable: drops and recreates the schema in a transactional block.
-- =========================================================================

begin;

-- ---- Extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---- Cleanup (safe to re-run) -------------------------------------------
drop table if exists public.task_completions cascade;
drop table if exists public.tasks            cascade;
drop table if exists public.rooms            cascade;
drop table if exists public.people           cascade;
drop table if exists public.household_members cascade;
drop table if exists public.households       cascade;
drop type  if exists public.frequency        cascade;
drop function if exists public.is_household_member(uuid) cascade;
drop function if exists public.handle_new_user()        cascade;

-- ---- Types --------------------------------------------------------------
create type public.frequency as enum ('daily', 'weekly', 'monthly', 'quarterly');

-- ---- Tables -------------------------------------------------------------

-- A single household (one family, one shared workspace)
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'My household',
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Auth users that have access to a household (the "logins")
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id)        on delete cascade,
  role         text not null default 'member' check (role in ('owner', 'member')),
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Assignable household members (people, including kids without accounts)
create table public.people (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  color        text not null default '#0ea5e9',
  created_at   timestamptz not null default now()
);

-- Rooms in the household
create table public.rooms (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

-- Recurring cleaning/chore tasks
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  room_id      uuid not null references public.rooms(id)      on delete cascade,
  title        text not null,
  frequency    public.frequency not null,
  notes        text,
  assigned_to  uuid references public.people(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Each time a task is checked off
create table public.task_completions (
  id              uuid primary key default gen_random_uuid(),
  task_id         uuid not null references public.tasks(id) on delete cascade,
  completed_at    timestamptz not null default now(),
  completed_by    uuid references auth.users(id) on delete set null,
  household_id    uuid not null references public.households(id) on delete cascade
);

create index on public.rooms (household_id, sort_order);
create index on public.tasks (household_id, room_id);
create index on public.task_completions (task_id, completed_at desc);
create index on public.task_completions (household_id, completed_at desc);

-- ---- Helper: is the current user a member of the given household? -------
create or replace function public.is_household_member(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = h
      and hm.user_id = auth.uid()
  );
$$;

-- ---- Row Level Security -------------------------------------------------
alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.people            enable row level security;
alter table public.rooms             enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_completions  enable row level security;

-- households: visible to its members; only the owner may delete
create policy "households_select" on public.households
  for select using (public.is_household_member(id));

create policy "households_insert" on public.households
  for insert with check (owner_id = auth.uid());

create policy "households_update" on public.households
  for update using (public.is_household_member(id))
  with check (public.is_household_member(id));

create policy "households_delete" on public.households
  for delete using (owner_id = auth.uid());

-- household_members: a user can see their own memberships
create policy "members_select" on public.household_members
  for select using (user_id = auth.uid() or public.is_household_member(household_id));

-- A user inserts their own membership when bootstrapping a household
create policy "members_insert_self" on public.household_members
  for insert with check (user_id = auth.uid());

create policy "members_delete_self" on public.household_members
  for delete using (user_id = auth.uid());

-- people / rooms / tasks / task_completions: scoped to household membership
create policy "people_all" on public.people
  for all using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "rooms_all" on public.rooms
  for all using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "tasks_all" on public.tasks
  for all using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "task_completions_all" on public.task_completions
  for all using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

commit;
