-- Test/review accounts must remain usable without appearing as family members.
-- The account itself can still read its own profile, while regular members only
-- see real family profiles. All existing real profiles default to visible.

alter table public.profiles
  add column if not exists is_test_account boolean not null default false;

comment on column public.profiles.is_test_account is
  'True for app-review/test logins that must not appear as family members.';

-- Mark the existing App Store/review profile without coupling the rule to a
-- generated UUID. This is intentionally a one-time data migration; future test
-- accounts should set is_test_account explicitly.
update public.profiles
set is_test_account = true
where lower(trim(display_name)) in ('app review', 'app test user')
   or lower(trim(coalesce(display_name_en, ''))) in ('app review', 'app test user');

drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_visible_or_self" on public.profiles;

create policy "profiles_select_visible_or_self" on public.profiles
  for select to authenticated
  using (not is_test_account or id = (select auth.uid()));
