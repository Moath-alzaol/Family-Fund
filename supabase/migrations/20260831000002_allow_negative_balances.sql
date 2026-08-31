-- Withdrawals, full monthly contributions, and shared-fund expenses may exceed
-- their current balances. Partial contribution payments remain disallowed.

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

  if p_type = 'contribution' then
    v_period := date_trunc('month', coalesce(p_period, (now() at time zone 'Asia/Amman')::date))::date;
    perform public.ensure_commitments_for_period(v_period);
    select * into v_commitment from public.commitments
    where profile_id = v_requester and period = v_period;

    v_due := v_commitment.required_fils - v_commitment.paid_fils;
    if v_due <= 0 then
      raise exception 'التزام هذا الشهر مدفوع بالكامل.' using errcode = 'FFR03';
    end if;

    if p_amount_fils <> v_due then
      raise exception 'الالتزام المستحق هذا الشهر % JOD ولا يقبل الدفع الجزئي.', public._format_jod(v_due)
        using errcode = 'FFR03';
    end if;
  end if;

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

create or replace function public.approve_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
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

  -- Contributions still require the exact outstanding amount, but all account
  -- types are intentionally allowed to become negative.
  if v_request.type = 'contribution' then
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

  end if;

  update public.requests
  set status = 'approved', decided_by = auth.uid(), decided_at = now()
  where id = p_request_id
  returning * into v_request;

  perform public._apply_request_effects(v_request);

  return v_request;
end;
$$;

revoke execute on function public.create_request(text, integer, text, text, date) from public;
revoke execute on function public.approve_request(uuid) from public;

grant execute on function public.create_request(text, integer, text, text, date) to authenticated;
grant execute on function public.approve_request(uuid) to authenticated;
