-- Durable, per-user notifications for request lifecycle events. The database
-- owns notification creation so events are emitted regardless of which client
-- (or future admin tool) performs the request action.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  request_id uuid not null references public.requests(id) on delete cascade,
  kind text not null check (kind in ('request_created', 'request_approved', 'request_rejected')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipient_id, request_id, kind)
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "members read their notifications"
on public.notifications for select
to authenticated
using (recipient_id = auth.uid());

create policy "members mark their notifications read"
on public.notifications for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke insert, delete on public.notifications from anon, authenticated;

create or replace function public._create_request_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    -- Every active family member receives every newly created request,
    -- including the requester as requested by the product rules.
    insert into public.notifications (recipient_id, actor_id, request_id, kind)
    select id, new.requester_id, new.id, 'request_created'
    from public.profiles
    where is_active
    on conflict (recipient_id, request_id, kind) do nothing;

  elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'approved' then
    insert into public.notifications (recipient_id, actor_id, request_id, kind)
    values (new.requester_id, new.decided_by, new.id, 'request_approved')
    on conflict (recipient_id, request_id, kind) do nothing;

  elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'rejected' then
    insert into public.notifications (recipient_id, actor_id, request_id, kind)
    values (new.requester_id, new.decided_by, new.id, 'request_rejected')
    on conflict (recipient_id, request_id, kind) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public._create_request_notifications() from public;

create trigger requests_create_notifications
after insert or update of status on public.requests
for each row execute function public._create_request_notifications();

-- Realtime provides immediate in-app/native presentation while the durable
-- row remains available for users who were offline.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
