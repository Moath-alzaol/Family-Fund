// Deliberately has zero React Native imports: strings.ts (used by pure
// domain logic like validation.ts) reads locale through this module, not
// through locale.ts, so that domain code stays importable under plain
// Node/Vitest. locale.ts (persistence, I18nManager, reload) is app-only.
export type Locale = 'ar' | 'en';

let currentLocale: Locale = 'ar';

export function getCurrentLocaleSync(): Locale {
  return currentLocale;
}

export function setCurrentLocaleState(locale: Locale): void {
  currentLocale = locale;
}

// The BCP-47 tag to hand to Intl.DateTimeFormat/NumberFormat for the current
// locale — kept distinct from Locale itself since Intl wants 'en-US', not 'en'.
export function intlLocaleTag(): string {
  return currentLocale === 'ar' ? 'ar' : 'en-US';
}

// Expo Go doesn't apply I18nManager.forceRTL()'s native mirroring at
// runtime (it only takes effect after a full native relaunch, which Expo
// Go's shared shell never gives it) — so layout direction is driven
// explicitly from locale state instead of I18nManager.isRTL everywhere in
// the UI. The app already fully reloads on language switch, so reading
// this at module-eval time in a screen's StyleSheet.create is safe.
export function isRTL(): boolean {
  return currentLocale === 'ar';
}
