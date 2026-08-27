-- One-time production transition from the worked demo data to a clean fund.
-- Keep auth users, profiles, roles, monthly commitment amounts, and settings.

begin;

delete from public.ledger_entries;
delete from public.requests;
delete from public.commitments;

commit;
