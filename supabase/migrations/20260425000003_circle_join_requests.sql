-- Join requests let users request access to a circle.
-- The circle owner sees them and can accept or reject.

create table public.circle_join_requests (
  id           uuid default gen_random_uuid() primary key,
  circle_id    uuid references public.circles(id) on delete cascade not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  status       text not null default 'pending'
               check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now(),
  unique (circle_id, requester_id)
);

alter table public.circle_join_requests enable row level security;

-- Requester sees their own; any circle member sees requests for their circle
create policy "jreq_select" on public.circle_join_requests for select
  using (auth.uid() = requester_id or public.is_circle_member(circle_id));

-- Anyone can request to join a circle (for themselves only)
create policy "jreq_insert" on public.circle_join_requests for insert
  with check (auth.uid() = requester_id);

-- Only the circle owner can update (accept / reject)
create policy "jreq_update" on public.circle_join_requests for update
  using (exists (
    select 1 from public.circles where id = circle_id and owner_id = auth.uid()
  ));

-- Enable realtime so the waiting screen auto-transitions on accept
alter publication supabase_realtime add table public.circle_members;
alter publication supabase_realtime add table public.circle_join_requests;
