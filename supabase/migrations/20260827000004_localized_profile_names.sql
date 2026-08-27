-- Keep both Arabic and English names so the client can follow its active
-- language without changing account identity or login usernames.

alter table public.profiles
  add column display_name_en text;

alter table public.profiles
  add constraint profiles_display_name_en_not_blank
  check (display_name_en is null or length(trim(display_name_en)) > 0);

update public.profiles as profile
set display_name = names.display_name,
  display_name_en = names.display_name_en
from auth.users as auth_user
join (
  values
    ('hani.alzaol@family-fund.local', 'هاني', 'Hani'),
    ('hamada.alzaol@family-fund.local', 'حمادة', 'Hamada'),
    ('moath.alzaol@family-fund.local', 'معاذ', 'Moath')
) as names(email, display_name, display_name_en) on names.email = auth_user.email
where profile.id = auth_user.id;

update auth.users as auth_user
set raw_user_meta_data = auth_user.raw_user_meta_data || jsonb_build_object(
  'display_name', names.display_name,
  'display_name_en', names.display_name_en
)
from (
  values
    ('hani.alzaol@family-fund.local', 'هاني', 'Hani'),
    ('hamada.alzaol@family-fund.local', 'حمادة', 'Hamada'),
    ('moath.alzaol@family-fund.local', 'معاذ', 'Moath')
) as names(email, display_name, display_name_en)
where names.email = auth_user.email;
