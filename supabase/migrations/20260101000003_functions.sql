-- All writes to requests / ledger_entries / commitments go through these
-- SECURITY DEFINER functions. Custom SQLSTATEs let the client map errors to
-- typed rules instead of parsing Arabic message text:
--   FFR01 insufficient personal balance (withdrawal)
--   FFR02 insufficient balance to cover a full contribution (no partial payment)
--   FFR03 commitment already fully paid, or amount doesn't match what's due
--   FFR04 insufficient fund balance (expense)
--   FFR05 admin-only action
--   FFR06 invalid input
--   FFR07 request not found / not in a state the action applies to
--   FFR08 not authenticated / inactive profile

create or replace function public._format_jod(p_fils integer)
returns text
language sql
immutable
as $$
  select trim(trailing '.' from trim(trailing '0' from to_char(p_fils / 1000.0, 'FM999999999990.999')))
$$;

create or replace function public._personal_balance(p_profile_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount_fils), 0)::integer
  from public.ledger_entries
  where account_type = 'personal' and account_owner = p_profile_id
$$;

create or replace function public._fund_balance()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount_fils), 0)::integer
  from public.ledger_entries
  where account_type = 'fund'
$$;

create or replace function public._require_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  ) then
    raise exception 'هذه العملية متاحة للمسؤول فقط.' using errcode = 'FFR05';
  end if;
end;
$$;

create or replace function public.ensure_commitments_for_period(p_period date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period date := date_trunc('month', p_period)::date;
begin
  insert into public.commitments (profile_id, period, required_fils, paid_fils)
  select p.id, v_period, p.monthly_commitment_fils, 0
  from public.profiles p
  where p.is_active
  on conflict (profile_id, period) do nothing;
end;
$$;

-- Applies the ledger/commitment side effects of an approved (or auto-executed)
-- request. Callers must have already set the request's status/decided_* fields.
create or replace function public._apply_request_effects(p_request public.requests)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester_name text;
begin
  if p_request.type = 'deposit' then
    insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, created_by)
    values ('personal', p_request.requester_id, p_request.amount_fils, 'deposit', p_request.id, coalesce(p_request.reason, 'إيداع شخصي'), p_request.decided_by);

  elsif p_request.type = 'withdrawal' then
    insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, created_by)
    values ('personal', p_request.requester_id, -p_request.amount_fils, 'withdrawal', p_request.id, coalesce(p_request.reason, 'سحب معتمد'), p_request.decided_by);

  elsif p_request.type = 'expense' then
    insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, created_by)
    values (
      'fund', null, -p_request.amount_fils, 'expense', p_request.id,
      coalesce('مصروف عائلي — ' || nullif(p_request.beneficiary, ''), p_request.reason, 'مصروف عائلي'),
      p_request.decided_by
    );

  elsif p_request.type = 'contribution' then
    select display_name into v_requester_name from public.profiles where id = p_request.requester_id;

    insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, created_by)
    values ('personal', p_request.requester_id, -p_request.amount_fils, 'contribution', p_request.id, 'مساهمة الالتزام الشهري', p_request.decided_by);

    insert into public.ledger_entries (account_type, account_owner, amount_fils, entry_type, request_id, description, created_by)
    values ('fund', null, p_request.amount_fils, 'contribution', p_request.id, 'مساهمة ' || v_requester_name, p_request.decided_by);

    update public.commitments
    set paid_fils = paid_fils + p_request.amount_fils
    where profile_id = p_request.requester_id and period = p_request.period;
  end if;
end;
$$;

create or replace function public.create_request(
  p_type text,
  p_amount_fils integer,
  p_reason text default null,
  p_beneficiary text default null,
  p_period date default null
)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_role text;
  v_balance integer;
  v_fund integer;
  v_period date;
  v_commitment public.commitments;
  v_due integer;
  v_request public.requests;
  v_auto boolean;
begin
  if v_requester is null then
    raise exception 'يجب تسجيل الدخول لإنشاء طلب.' using errcode = 'FFR08';
  end if;

  select role into v_role from public.profiles where id = v_requester and is_active;
  if v_role is null then
    raise exception 'الحساب غير نشط أو غير موجود.' using errcode = 'FFR08';
  end if;

  if p_type not in ('deposit', 'withdrawal', 'contribution', 'expense') then
    raise exception 'نوع الطلب غير صالح.' using errcode = 'FFR06';
  end if;

  if p_amount_fils is null or p_amount_fils <= 0 then
    raise exception 'أدخل مبلغًا أكبر من صفر.' using errcode = 'FFR06';
  end if;

  if p_type = 'withdrawal' then
    v_balance := public._personal_balance(v_requester);
    if p_amount_fils > v_balance then
      raise exception 'رصيدك الشخصي غير كافٍ لهذه العملية. الرصيد المتاح: % JOD', public._format_jod(v_balance)
        using errcode = 'FFR01';
    end if;
  end if;

  if p_type = 'contribution' then
    v_period := date_trunc('month', coalesce(p_period, (now() at time zone 'Asia/Amman')::date))::date;
    perform public.ensure_commitments_for_period(v_period);
    select * into v_commitment from public.commitments
    where profile_id = v_requester and period = v_period;

    v_due := v_commitment.required_fils - v_commitment.paid_fils;
    if v_due <= 0 then
      raise exception 'التزام هذا الشهر مدفوع بالكامل.' using errcode = 'FFR03';
    end if;

    v_balance := public._personal_balance(v_requester);
    if p_amount_fils > v_balance then
      raise exception 'الرصيد غير كافٍ لدفع كامل الالتزام. لا يتم خصم مبلغ جزئي — الالتزام يبقى غير مدفوع. الرصيد المتاح: % JOD', public._format_jod(v_balance)
        using errcode = 'FFR02';
    end if;

    if p_amount_fils <> v_due then
      raise exception 'الالتزام المستحق هذا الشهر % JOD ولا يقبل الدفع الجزئي.', public._format_jod(v_due)
        using errcode = 'FFR03';
    end if;
  end if;

  if p_type = 'expense' then
    v_fund := public._fund_balance();
    if p_amount_fils > v_fund then
      raise exception 'رصيد الصندوق غير كافٍ. رصيد الصندوق: % JOD', public._format_jod(v_fund)
        using errcode = 'FFR04';
    end if;
  end if;

  -- Only the admin's own withdrawal auto-executes (rule §1.6). His deposits and
  -- expense requests always go through the normal pending -> approve pipeline.
  v_auto := (v_role = 'admin' and p_type = 'withdrawal');

  insert into public.requests (
    type, requester_id, amount_fils, reason, beneficiary, period, status,
    decided_by, decided_at, auto_executed
  ) values (
    p_type, v_requester, p_amount_fils, p_reason,
    case when p_type = 'expense' then p_beneficiary else null end,
    case when p_type = 'contribution' then v_period else null end,
    case when v_auto then 'approved' else 'pending' end,
    case when v_auto then v_requester else null end,
    case when v_auto then now() else null end,
    v_auto
  )
  returning * into v_request;

  if v_auto then
    perform public._apply_request_effects(v_request);
  end if;

  return v_request;
end;
$$;

create or replace function public.approve_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
  v_balance integer;
  v_fund integer;
  v_commitment public.commitments;
  v_due integer;
begin
  perform public._require_admin();

  select * into v_request from public.requests where id = p_request_id for update;
  if v_request is null then
    raise exception 'الطلب غير موجود.' using errcode = 'FFR07';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'لا يمكن اعتماد طلب ليس بحالة الانتظار.' using errcode = 'FFR07';
  end if;

  -- Re-validate at decision time: state may have drifted since creation.
  if v_request.type = 'withdrawal' then
    v_balance := public._personal_balance(v_request.requester_id);
    if v_request.amount_fils > v_balance then
      raise exception 'رصيد مقدّم الطلب غير كافٍ الآن لهذه العملية. الرصيد المتاح: % JOD', public._format_jod(v_balance)
        using errcode = 'FFR01';
    end if;

  elsif v_request.type = 'contribution' then
    select * into v_commitment from public.commitments
    where profile_id = v_request.requester_id and period = v_request.period;
    if v_commitment is null then
      raise exception 'تعذّر إيجاد سجل الالتزام لهذه الفترة.' using errcode = 'FFR07';
    end if;

    v_due := v_commitment.required_fils - v_commitment.paid_fils;
    if v_due <= 0 then
      raise exception 'الالتزام مدفوع بالكامل بالفعل.' using errcode = 'FFR03';
    end if;
    if v_request.amount_fils <> v_due then
      raise exception 'قيمة الطلب لا تطابق المتبقي من الالتزام حاليًا.' using errcode = 'FFR03';
    end if;

    v_balance := public._personal_balance(v_request.requester_id);
    if v_request.amount_fils > v_balance then
      raise exception 'رصيد مقدّم الطلب غير كافٍ الآن لدفع الالتزام. الرصيد المتاح: % JOD', public._format_jod(v_balance)
        using errcode = 'FFR02';
    end if;

  elsif v_request.type = 'expense' then
    v_fund := public._fund_balance();
    if v_request.amount_fils > v_fund then
      raise exception 'رصيد الصندوق غير كافٍ الآن لهذا المصروف. رصيد الصندوق: % JOD', public._format_jod(v_fund)
        using errcode = 'FFR04';
    end if;
  end if;

  update public.requests
  set status = 'approved', decided_by = auth.uid(), decided_at = now()
  where id = p_request_id
  returning * into v_request;

  perform public._apply_request_effects(v_request);

  return v_request;
end;
$$;

create or replace function public.reject_request(p_request_id uuid, p_reason text)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
begin
  perform public._require_admin();

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'سبب الرفض مطلوب.' using errcode = 'FFR06';
  end if;

  select * into v_request from public.requests where id = p_request_id for update;
  if v_request is null then
    raise exception 'الطلب غير موجود.' using errcode = 'FFR07';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'لا يمكن رفض طلب ليس بحالة الانتظار.' using errcode = 'FFR07';
  end if;

  update public.requests
  set status = 'rejected', decided_by = auth.uid(), decided_at = now(), rejection_reason = trim(p_reason)
  where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

-- MVP has no invite flow (see brief §8.4): the admin provisions a real auth
-- account directly, the same way seed.sql provisions the three brothers, and
-- returns the temporary password once so it can be handed to the new member
-- out of band. There is no email delivery in this MVP.
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

  v_slug := lower(regexp_replace(trim(p_display_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_email := v_slug || '-' || substr(v_user_id::text, 1, 8) || '@family-fund.local';

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
    'email', v_email,
    'temporary_password', v_password
  );
end;
$$;

revoke execute on function public.create_request(text, integer, text, text, date) from public;
revoke execute on function public.approve_request(uuid) from public;
revoke execute on function public.reject_request(uuid, text) from public;
revoke execute on function public.add_member(text, integer) from public;
revoke execute on function public.ensure_commitments_for_period(date) from public;

grant execute on function public.create_request(text, integer, text, text, date) to authenticated;
grant execute on function public.approve_request(uuid) to authenticated;
grant execute on function public.reject_request(uuid, text) to authenticated;
grant execute on function public.add_member(text, integer) to authenticated;
grant execute on function public.ensure_commitments_for_period(date) to authenticated;
