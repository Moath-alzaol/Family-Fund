import { getCurrentLocaleSync } from '@/i18n/locale-state';

export interface LocalizedProfileName {
  display_name: string;
  display_name_en?: string | null;
}

export function profileDisplayName(profile: LocalizedProfileName): string {
  const englishName = profile.display_name_en?.trim();
  return getCurrentLocaleSync() === 'en' && englishName ? englishName : profile.display_name;
}

export function localizeProfile<T extends LocalizedProfileName>(profile: T): T {
  return { ...profile, display_name: profileDisplayName(profile) };
}
