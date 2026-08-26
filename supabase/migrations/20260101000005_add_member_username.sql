-- Match the family's own login convention (firstname.alzaol style): a clean
-- "name.name@family-fund.local" slug, only falling back to a numeric suffix
-- if that exact address is already taken.
create or replace function public.add_member(p_display_name text, p_commitment_fils integer)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
  v_slug text;
  v_email text;
  v_suffix integer := 1;
  v_password text := encode(gen_random_bytes(9), 'base64');
  v_profile public.profiles;
begin
  perform public._require_admin();

  if p_display_name is null or length(trim(p_display_name)) = 0 then
    raise exception 'اسم العضو مطلوب.' using errcode = 'FFR06';
  end if;
  if p_commitment_fils is null or p_commitment_fils < 0 then
    raise exception 'الالتزام الشهري غير صالح.' using errcode = 'FFR06';
  end if;

  v_slug := lower(regexp_replace(trim(p_display_name), '[^a-zA-Z0-9]+', '.', 'g'));
  v_slug := trim(both '.' from v_slug);
  v_email := v_slug || '@family-fund.local';

  while exists (select 1 from auth.users where email = v_email) loop
    v_suffix := v_suffix + 1;
    v_email := v_slug || v_suffix::text || '@family-fund.local';
  end loop;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    v_email, crypt(v_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('display_name', p_display_name),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_user_id, v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email', now(), now(), now()
  );

  insert into public.profiles (id, display_name, role, monthly_commitment_fils)
  values (v_user_id, trim(p_display_name), 'member', p_commitment_fils)
  returning * into v_profile;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'username', v_slug || case when v_suffix > 1 then v_suffix::text else '' end,
    'email', v_email,
    'temporary_password', v_password
  );
end;
$$;

revoke execute on function public.add_member(text, integer) from public;
grant execute on function public.add_member(text, integer) to authenticated;
