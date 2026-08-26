-- service_role already has INSERT on ledger_entries for ops corrections
-- (20260101000002_rls.sql). Extend the same trusted-ops access to requests
-- and commitments so seed/ops scripts can write historical demo data
-- directly, without needing to fake a session through create_request/
-- approve_request for every row.
grant insert, update on public.requests to service_role;
grant insert, update on public.commitments to service_role;
