-- Keep internal helpers private and expose only the authenticated RPC surface.
-- Explicit anon revokes avoid relying on inherited/default function grants.

alter function public._format_jod(integer) set search_path = '';

revoke execute on function public._format_jod(integer) from public, anon, authenticated;
revoke execute on function public._personal_balance(uuid) from public, anon, authenticated;
revoke execute on function public._fund_balance() from public, anon, authenticated;
revoke execute on function public._require_admin() from public, anon, authenticated;
revoke execute on function public._apply_request_effects(public.requests) from public, anon, authenticated;

revoke execute on function public.create_request(text, integer, text, text, date) from public, anon, authenticated;
revoke execute on function public.approve_request(uuid) from public, anon, authenticated;
revoke execute on function public.reject_request(uuid, text) from public, anon, authenticated;
revoke execute on function public.add_member(text, integer) from public, anon, authenticated;
revoke execute on function public.ensure_commitments_for_period(date) from public, anon, authenticated;
revoke execute on function public.set_admin_deposit_requires_approval(boolean) from public, anon, authenticated;

grant execute on function public.create_request(text, integer, text, text, date) to authenticated;
grant execute on function public.approve_request(uuid) to authenticated;
grant execute on function public.reject_request(uuid, text) to authenticated;
grant execute on function public.add_member(text, integer) to authenticated;
grant execute on function public.ensure_commitments_for_period(date) to authenticated;
grant execute on function public.set_admin_deposit_requires_approval(boolean) to authenticated;
