-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Auto-created on signup via trigger (see bottom of file)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  hue         integer not null default 200 check (hue >= 0 and hue <= 359),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Circles (households / groups) ─────────────────────────────────────────────
create table public.circles (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  owner_id    uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Circle membership ──────────────────────────────────────────────────────────
create table public.circle_members (
  circle_id  uuid references public.circles(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  joined_at  timestamptz not null default now(),
  primary key (circle_id, user_id)
);

-- ── Tasks ──────────────────────────────────────────────────────────────────────
create table public.tasks (
  id           uuid default gen_random_uuid() primary key,
  circle_id    uuid references public.circles(id) on delete cascade not null,
  title        text not null,
  note         text,
  category     text,
  weight       integer not null default 3 check (weight >= 1 and weight <= 5),
  status       text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  due_date     date,
  planner_id   uuid references auth.users(id),
  organizer_id uuid references auth.users(id),
  reminder_id  uuid references auth.users(id),
  executor_id  uuid references auth.users(id),
  created_by   uuid references auth.users(id) not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Row-Level Security ─────────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.circles        enable row level security;
alter table public.circle_members enable row level security;
alter table public.tasks          enable row level security;

-- Helper: is the current user a member of (or owner of) a given circle?
create or replace function public.is_circle_member(cid uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = cid and user_id = auth.uid()
  ) or exists (
    select 1 from public.circles
    where id = cid and owner_id = auth.uid()
  );
$$;

-- profiles: own profile + coworkers in shared circles
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = id
  or exists (
    select 1 from public.circle_members a
    join public.circle_members b on a.circle_id = b.circle_id
    where a.user_id = auth.uid() and b.user_id = profiles.id
  )
);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- circles: visible to members, mutable by owner
create policy "circles_select" on public.circles for select  using (public.is_circle_member(id));
create policy "circles_insert" on public.circles for insert  with check (auth.uid() = owner_id);
create policy "circles_update" on public.circles for update  using (auth.uid() = owner_id);
create policy "circles_delete" on public.circles for delete  using (auth.uid() = owner_id);

-- circle_members: members see their own circle rows; owner can add/remove
create policy "members_select" on public.circle_members for select
  using (auth.uid() = user_id or public.is_circle_member(circle_id));
create policy "members_insert" on public.circle_members for insert
  with check (
    auth.uid() = user_id
    or exists (select 1 from public.circles where id = circle_id and owner_id = auth.uid())
  );
create policy "members_delete" on public.circle_members for delete
  using (
    auth.uid() = user_id
    or exists (select 1 from public.circles where id = circle_id and owner_id = auth.uid())
  );

-- tasks: any circle member can CRUD
create policy "tasks_select" on public.tasks for select  using (public.is_circle_member(circle_id));
create policy "tasks_insert" on public.tasks for insert  with check (public.is_circle_member(circle_id));
create policy "tasks_update" on public.tasks for update  using (public.is_circle_member(circle_id));
create policy "tasks_delete" on public.tasks for delete  using (public.is_circle_member(circle_id));

-- ── Triggers ───────────────────────────────────────────────────────────────────

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, hue)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    (extract(epoch from now())::bigint % 360)::integer
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-add owner as member when a circle is created
create or replace function public.handle_new_circle()
returns trigger language plpgsql security definer as $$
begin
  insert into public.circle_members (circle_id, user_id)
  values (new.id, new.owner_id);
  return new;
end;
$$;

create trigger on_circle_created
  after insert on public.circles
  for each row execute procedure public.handle_new_circle();

-- Keep updated_at in sync
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger set_updated_at before update on public.circles
  for each row execute procedure public.handle_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute procedure public.handle_updated_at();
