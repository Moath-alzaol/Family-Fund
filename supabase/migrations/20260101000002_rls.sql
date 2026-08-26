-- Transparency: every authenticated profile can read everything.
-- Mutation happens only inside SECURITY DEFINER functions (see 20260101000003_functions.sql),
-- which run as the migration owner and so bypass RLS by design. No INSERT/UPDATE/DELETE
-- policy exists anywhere below — that omission is the enforcement, not an oversight.

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.commitments enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "requests_select_authenticated" on public.requests
  for select to authenticated using (true);

create policy "ledger_entries_select_authenticated" on public.ledger_entries
  for select to authenticated using (true);

create policy "commitments_select_authenticated" on public.commitments
  for select to authenticated using (true);

grant select on public.profiles to authenticated;
grant select on public.requests to authenticated;
grant select on public.ledger_entries to authenticated;
grant select on public.commitments to authenticated;
grant select on public.v_personal_balances to authenticated;
grant select on public.v_fund_balance to authenticated;

revoke insert, update, delete on public.profiles from authenticated, anon;
revoke insert, update, delete on public.requests from authenticated, anon;
revoke insert, update, delete on public.ledger_entries from authenticated, anon;
revoke insert, update, delete on public.commitments from authenticated, anon;

-- service_role bypasses RLS but still needs explicit grants under Supabase's
-- "no auto-expose" default. Read access for ops/tooling; write access on the
-- ledger is INSERT-only — even service_role can never UPDATE or DELETE a
-- ledger row, so "immutable, ever" holds regardless of which role connects.
grant select on public.profiles to service_role;
grant select on public.requests to service_role;
grant select on public.ledger_entries to service_role;
grant select on public.commitments to service_role;
grant select on public.v_personal_balances to service_role;
grant select on public.v_fund_balance to service_role;
grant insert on public.ledger_entries to service_role;
