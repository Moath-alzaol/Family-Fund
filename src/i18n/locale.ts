import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings, I18nManager, Platform } from 'react-native';

import { getCurrentLocaleSync, intlLocaleTag, isRTL, setCurrentLocaleState, type Locale } from '@/i18n/locale-state';

export type { Locale };
export { getCurrentLocaleSync, intlLocaleTag, isRTL };

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

// RTL/LTR switching in React Native only takes visual effect after a reload —
// I18nManager.isRTL is read once when style logical properties are resolved,
// so flipping the flag alone doesn't re-layout anything already mounted.
function applyDirection(locale: Locale) {
  const isRTL = locale === 'ar';
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
    return;
  }
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
}

// Apply the app's default direction the instant this module evaluates —
// before any React rendering and before the AsyncStorage read below resolves.
// I18nManager only affects layout for view trees created *after* it's called,
// so this has to run as early as possible; waiting for the (async) stored
// preference first left the very first paint using the platform's default
// (LTR) direction instead of Arabic/RTL.
applyDirection('ar');

export async function initLocale(): Promise<Locale> {
  const stored = await readStoredLocale();
  setCurrentLocaleState(stored ?? 'ar');
  applyDirection(getCurrentLocaleSync());
  return getCurrentLocaleSync();
}

export async function setLocale(locale: Locale): Promise<void> {
  if (locale === getCurrentLocaleSync()) return;
  setCurrentLocaleState(locale);
  await writeStoredLocale(locale);
  applyDirection(locale);

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.location.reload();
    return;
  }
  // Development-only reload path (Expo Go / dev client). A standalone
  // production build would need expo-updates' reloadAsync() instead.
  if (__DEV__ && DevSettings.reload) {
    DevSettings.reload();
  }
}
