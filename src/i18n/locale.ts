import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  getCurrentLocaleSync,
  intlLocaleTag,
  isRTL,
  setCurrentLocaleState,
  subscribeToLocale,
  type Locale,
} from '@/i18n/locale-state';

export type { Locale };
export { getCurrentLocaleSync, intlLocaleTag, isRTL, subscribeToLocale };

const STORAGE_KEY = 'family-fund:locale';

function isLocale(value: string | null): value is Locale {
  return value === 'ar' || value === 'en';
}

async function readStoredLocale(): Promise<Locale | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  }
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return isLocale(value) ? value : null;
}

async function writeStoredLocale(locale: Locale): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, locale);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, locale);
}

function applyDirection(locale: Locale) {
  const isRTL = locale === 'ar';
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }
}

export async function initLocale(): Promise<Locale> {
  const stored = await readStoredLocale();
  setCurrentLocaleState(stored ?? 'ar');
  applyDirection(getCurrentLocaleSync());
  return getCurrentLocaleSync();
}

export async function setLocale(locale: Locale): Promise<void> {
  if (locale === getCurrentLocaleSync()) return;
  await writeStoredLocale(locale);
  setCurrentLocaleState(locale);
  applyDirection(locale);
}
