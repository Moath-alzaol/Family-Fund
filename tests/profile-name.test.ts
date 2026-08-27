import { afterEach, describe, expect, it } from 'vitest';

import { profileDisplayName } from '../src/domain/profile';
import { setCurrentLocaleState } from '../src/i18n/locale-state';

afterEach(() => setCurrentLocaleState('ar'));

describe('profileDisplayName', () => {
  const profile = { display_name: 'معاذ', display_name_en: 'Moath' };

  it('uses the Arabic name in Arabic', () => {
    setCurrentLocaleState('ar');
    expect(profileDisplayName(profile)).toBe('معاذ');
  });

  it('uses the English name in English', () => {
    setCurrentLocaleState('en');
    expect(profileDisplayName(profile)).toBe('Moath');
  });

  it('falls back to Arabic when an English name is not available', () => {
    setCurrentLocaleState('en');
    expect(profileDisplayName({ display_name: 'عضو', display_name_en: null })).toBe('عضو');
  });
});
