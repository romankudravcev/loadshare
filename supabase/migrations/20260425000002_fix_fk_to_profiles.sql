-- Fix FK relationships so PostgREST can navigate circle_members → profiles
-- and tasks → profiles for embedded queries.
--
-- Root cause: the original FKs pointed to auth.users (not in public schema),
-- so PostgREST couldn't find the join path to public.profiles.

-- ── circle_members ────────────────────────────────────────────────────────────
alter table public.circle_members
  drop constraint circle_members_user_id_fkey;

alter table public.circle_members
  add constraint circle_members_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- ── tasks: role columns ───────────────────────────────────────────────────────
alter table public.tasks drop constraint if exists tasks_planner_id_fkey;
alter table public.tasks drop constraint if exists tasks_organizer_id_fkey;
alter table public.tasks drop constraint if exists tasks_reminder_id_fkey;
alter table public.tasks drop constraint if exists tasks_executor_id_fkey;
alter table public.tasks drop constraint if exists tasks_created_by_fkey;

alter table public.tasks
  add constraint tasks_planner_id_fkey
    foreign key (planner_id) references public.profiles(id) on delete set null;

alter table public.tasks
  add constraint tasks_organizer_id_fkey
    foreign key (organizer_id) references public.profiles(id) on delete set null;

alter table public.tasks
  add constraint tasks_reminder_id_fkey
    foreign key (reminder_id) references public.profiles(id) on delete set null;

alter table public.tasks
  add constraint tasks_executor_id_fkey
    foreign key (executor_id) references public.profiles(id) on delete set null;

alter table public.tasks
  add constraint tasks_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete cascade;
