// Deliberately has zero React Native imports: strings.ts (used by pure
// domain logic like validation.ts) reads locale through this module, not
// through locale.ts, so that domain code stays importable under plain
// Node/Vitest. locale.ts (persistence, I18nManager, reload) is app-only.
export type Locale = 'ar' | 'en';

let currentLocale: Locale = 'ar';
const listeners = new Set<(locale: Locale) => void>();

export function getCurrentLocaleSync(): Locale {
  return currentLocale;
}

export function setCurrentLocaleState(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  listeners.forEach((listener) => listener(locale));
}

export function subscribeToLocale(listener: (locale: Locale) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The BCP-47 tag to hand to Intl.DateTimeFormat/NumberFormat for the current
// locale — kept distinct from Locale itself since Intl wants 'en-US', not 'en'.
export function intlLocaleTag(): string {
  return currentLocale === 'ar' ? 'ar' : 'en-US';
}

// Layout direction is driven explicitly from locale state so Expo Go and
// standalone builds behave identically. RootLayout remounts the navigation
// tree when this value changes, which refreshes every locale-aware style.
export function isRTL(): boolean {
  return currentLocale === 'ar';
}
