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

-- Financial data intentionally starts empty. The app creates the current
-- period's unpaid commitment rows lazily when an authenticated member opens
-- the dashboard; balances remain zero until real requests are approved.
