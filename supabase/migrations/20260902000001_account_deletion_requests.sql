-- Apple requires apps that support account creation to let every user start
-- deletion from inside the app. The family's shared financial ledger needs a
-- manual retention/anonymisation review, so this table records the request
-- immediately while an operator completes it within the promised time.

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.account_deletion_requests enable row level security;

create policy "account_deletion_requests_select_own"
  on public.account_deletion_requests
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.account_deletion_requests from anon, authenticated;
grant select on public.account_deletion_requests to authenticated;
grant all on public.account_deletion_requests to service_role;

create or replace function public.request_account_deletion()
returns public.account_deletion_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_request public.account_deletion_requests;
begin
  if v_user_id is null or not exists (
    select 1 from public.profiles where id = v_user_id
  ) then
    raise exception 'يجب تسجيل الدخول لطلب حذف الحساب.' using errcode = 'FFR08';
  end if;

  insert into public.account_deletion_requests (user_id, status, requested_at, completed_at)
  values (v_user_id, 'pending', now(), null)
  on conflict (user_id) do update
  set status = 'pending', requested_at = now(), completed_at = null
  returning * into v_request;

  return v_request;
end;
$$;

revoke execute on function public.request_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;
