-- Make the exposed balance views evaluate with the caller's permissions so
-- the RLS policies on profiles and ledger_entries are always enforced.

alter view public.v_personal_balances set (security_invoker = true);
alter view public.v_fund_balance set (security_invoker = true);
