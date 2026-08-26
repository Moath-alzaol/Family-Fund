-- Family Fund: core schema. Amounts are integers in fils (1 JOD = 1000 fils).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin', 'member')),
  monthly_commitment_fils integer not null check (monthly_commitment_fils >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('deposit', 'withdrawal', 'contribution', 'expense')),
  requester_id uuid not null references public.profiles (id),
  amount_fils integer not null check (amount_fils > 0),
  reason text,
  beneficiary text,
  period date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by uuid references public.profiles (id),
  decided_at timestamptz,
  rejection_reason text,
  auto_executed boolean not null default false,
  created_at timestamptz not null default now()
);

create index requests_status_idx on public.requests (status);
create index requests_requester_id_idx on public.requests (requester_id);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('personal', 'fund')),
  account_owner uuid references public.profiles (id),
  amount_fils integer not null,
  entry_type text not null check (
    entry_type in ('deposit', 'withdrawal', 'contribution', 'expense', 'opening_balance', 'adjustment')
  ),
  request_id uuid references public.requests (id),
  description text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint fund_has_no_owner check (
    (account_type = 'fund' and account_owner is null) or
    (account_type = 'personal' and account_owner is not null)
  )
);

create index ledger_entries_account_owner_idx on public.ledger_entries (account_owner, occurred_at);
create index ledger_entries_account_type_idx on public.ledger_entries (account_type, occurred_at);
create index ledger_entries_request_id_idx on public.ledger_entries (request_id);

-- Ledger rows are immutable: no update/delete trigger, no update/delete grant, ever.

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id),
  period date not null,
  required_fils integer not null,
  paid_fils integer not null default 0,
  unique (profile_id, period)
);

create index commitments_period_idx on public.commitments (period);

-- Balances are derived from the ledger, never stored as a mutable column.

create view public.v_personal_balances as
select
  p.id as profile_id,
  coalesce(sum(l.amount_fils) filter (where l.account_type = 'personal'), 0)::integer as balance_fils
from public.profiles p
left join public.ledger_entries l on l.account_owner = p.id and l.account_type = 'personal'
group by p.id;

create view public.v_fund_balance as
select coalesce(sum(amount_fils), 0)::integer as balance_fils
from public.ledger_entries
where account_type = 'fund';
