import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getCurrentLocaleSync,
  isRTL,
  setCurrentLocaleState,
  subscribeToLocale,
} from '../src/i18n/locale-state';

describe('locale state', () => {
  afterEach(() => setCurrentLocaleState('ar'));

  it('switches direction with the selected locale', () => {
    setCurrentLocaleState('en');
    expect(getCurrentLocaleSync()).toBe('en');
    expect(isRTL()).toBe(false);

    setCurrentLocaleState('ar');
    expect(isRTL()).toBe(true);
  });

  it('notifies the app once per actual locale change', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLocale(listener);

    setCurrentLocaleState('en');
    setCurrentLocaleState('en');
    unsubscribe();
    setCurrentLocaleState('ar');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('en');
  });
});
