-- Local/dev seed: the three brothers, matching the brief's worked example.
-- Password for all three accounts locally is: password123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'hani.alzaol@family-fund.local', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"هاني"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'hamada.alzaol@family-fund.local', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"محمد"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
   'moath.alzaol@family-fund.local', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"معاذ"}', now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"hani.alzaol@family-fund.local"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"hamada.alzaol@family-fund.local"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"moath.alzaol@family-fund.local"}', 'email', now(), now(), now());

insert into public.profiles (id, display_name, role, monthly_commitment_fils) values
  ('11111111-1111-1111-1111-111111111111', 'هاني', 'member', 100000),
  ('22222222-2222-2222-2222-222222222222', 'محمد', 'member', 50000),
  ('33333333-3333-3333-3333-333333333333', 'معاذ', 'admin', 50000);

-- Opening balances, dated before the current month.
insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, description, occurred_at, created_by) values
  ('personal', '11111111-1111-1111-1111-111111111111', 1600000, 'opening_balance', 'رصيد افتتاحي', '2026-07-31 12:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('personal', '22222222-2222-2222-2222-222222222222', 800000, 'opening_balance', 'رصيد افتتاحي', '2026-07-31 12:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('personal', '33333333-3333-3333-3333-333333333333', 1550000, 'opening_balance', 'رصيد افتتاحي', '2026-07-31 12:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('fund', null, 1200000, 'opening_balance', 'رصيد افتتاحي', '2026-07-31 12:00:00+00', '33333333-3333-3333-3333-333333333333');

-- Current month (August 2026) history: approved requests + their ledger effects.
insert into public.requests (
  id, type, requester_id, amount_fils, reason, beneficiary, period, status, decided_by, decided_at, auto_executed, created_at
) values
  ('b0000000-0000-0000-0000-000000000001', 'deposit', '11111111-1111-1111-1111-111111111111', 1000000, null, null, null,
   'approved', '33333333-3333-3333-3333-333333333333', '2026-08-03 10:00:00+00', false, '2026-08-03 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000002', 'withdrawal', '11111111-1111-1111-1111-111111111111', 500000, 'احتياج شخصي', null, null,
   'approved', '33333333-3333-3333-3333-333333333333', '2026-08-09 10:00:00+00', false, '2026-08-09 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000003', 'contribution', '11111111-1111-1111-1111-111111111111', 100000, 'دفع التزام أغسطس من الرصيد الشخصي', null, '2026-08-01',
   'approved', '33333333-3333-3333-3333-333333333333', '2026-08-12 10:00:00+00', false, '2026-08-12 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000004', 'contribution', '33333333-3333-3333-3333-333333333333', 50000, 'دفع التزام أغسطس', null, '2026-08-01',
   'approved', '33333333-3333-3333-3333-333333333333', '2026-08-13 10:00:00+00', false, '2026-08-13 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000005', 'expense', '11111111-1111-1111-1111-111111111111', 100000, null, 'الوالد', null,
   'approved', '33333333-3333-3333-3333-333333333333', '2026-08-17 10:00:00+00', false, '2026-08-17 09:00:00+00');

insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, occurred_at, created_by) values
  ('personal', '11111111-1111-1111-1111-111111111111', 1000000, 'deposit', 'b0000000-0000-0000-0000-000000000001', 'إيداع شخصي', '2026-08-03 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('personal', '11111111-1111-1111-1111-111111111111', -500000, 'withdrawal', 'b0000000-0000-0000-0000-000000000002', 'سحب معتمد', '2026-08-09 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('personal', '11111111-1111-1111-1111-111111111111', -100000, 'contribution', 'b0000000-0000-0000-0000-000000000003', 'مساهمة الالتزام الشهري', '2026-08-12 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('fund', null, 100000, 'contribution', 'b0000000-0000-0000-0000-000000000003', 'مساهمة هاني — أغسطس', '2026-08-12 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('personal', '33333333-3333-3333-3333-333333333333', -50000, 'contribution', 'b0000000-0000-0000-0000-000000000004', 'مساهمة الالتزام الشهري', '2026-08-13 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('fund', null, 50000, 'contribution', 'b0000000-0000-0000-0000-000000000004', 'مساهمة معاذ — أغسطس', '2026-08-13 10:00:00+00', '33333333-3333-3333-3333-333333333333'),
  ('fund', null, -100000, 'expense', 'b0000000-0000-0000-0000-000000000005', 'مصروف عائلي — الوالد', '2026-08-17 10:00:00+00', '33333333-3333-3333-3333-333333333333');

insert into public.commitments (profile_id, period, required_fils, paid_fils) values
  ('11111111-1111-1111-1111-111111111111', '2026-08-01', 100000, 100000),
  ('22222222-2222-2222-2222-222222222222', '2026-08-01', 50000, 0),
  ('33333333-3333-3333-3333-333333333333', '2026-08-01', 50000, 50000);

-- Two pending requests awaiting the admin's decision.
insert into public.requests (id, type, requester_id, amount_fils, reason, beneficiary, period, status, created_at) values
  ('b0000000-0000-0000-0000-000000000006', 'withdrawal', '11111111-1111-1111-1111-111111111111', 500000, 'احتياج شخصي', null, null, 'pending', '2026-08-21 12:00:00+00'),
  ('b0000000-0000-0000-0000-000000000007', 'contribution', '22222222-2222-2222-2222-222222222222', 50000, 'دفع التزام أغسطس من الرصيد الشخصي', null, '2026-08-01', 'pending', '2026-08-21 12:00:00+00');
