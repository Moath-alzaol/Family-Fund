import { getCurrentLocaleSync } from '@/i18n/locale-state';
import { ar } from '@/i18n/locales/ar';
import { en } from '@/i18n/locales/en';
import type { Strings } from '@/i18n/types';

const LOCALES: Record<'ar' | 'en', Strings> = { ar, en };

// A Proxy instead of a plain export so every `strings.xxx` call site reads
// the *current* locale without needing to become a hook — switching locale
// triggers a full reload (see src/i18n/locale.ts), so a fresh read here is
// all that's needed; no React reactivity required.
export const strings: Strings = new Proxy({} as Strings, {
  get(_target, prop: keyof Strings) {
    return LOCALES[getCurrentLocaleSync()][prop];
  },
});
