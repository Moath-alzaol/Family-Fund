-- Single-row config table (brief §8.1): admin_deposit_requires_approval must
-- be flippable without a code change. Default true per the decided answer —
-- admin's own deposit goes through the normal pending -> approve pipeline,
-- same as everyone else. Only his withdrawal is exempt from approval.

create table public.app_settings (
  id integer primary key default 1 check (id = 1),
  admin_deposit_requires_approval boolean not null default true
);

insert into public.app_settings (id) values (1);

alter table public.app_settings enable row level security;

create policy "app_settings_select_authenticated" on public.app_settings
  for select to authenticated using (true);

grant select on public.app_settings to authenticated;
grant select on public.app_settings to service_role;

revoke insert, update, delete on public.app_settings from authenticated, anon;

create or replace function public.set_admin_deposit_requires_approval(p_value boolean)
returns public.app_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.app_settings;
begin
  perform public._require_admin();

  update public.app_settings set admin_deposit_requires_approval = p_value where id = 1
  returning * into v_settings;

  return v_settings;
end;
$$;

revoke execute on function public.set_admin_deposit_requires_approval(boolean) from public;
grant execute on function public.set_admin_deposit_requires_approval(boolean) to authenticated;

-- Re-plumb create_request's auto-execute check through the flag.
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
  v_deposit_requires_approval boolean;
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

  -- Only the admin's own withdrawal always auto-executes (rule §1.6). His
  -- deposit auto-executes only if admin_deposit_requires_approval is false;
  -- his expense requests always go through the normal pending -> approve flow.
  select admin_deposit_requires_approval into v_deposit_requires_approval from public.app_settings where id = 1;

  v_auto := (v_role = 'admin' and p_type = 'withdrawal')
    or (v_role = 'admin' and p_type = 'deposit' and not v_deposit_requires_approval);

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

revoke execute on function public.create_request(text, integer, text, text, date) from public;
grant execute on function public.create_request(text, integer, text, text, date) to authenticated;
