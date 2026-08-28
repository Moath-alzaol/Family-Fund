import { beforeEach, describe, expect, it } from 'vitest';

import { buildBalanceSummary } from '@/domain/balance-summary';
import { setCurrentLocaleState } from '@/i18n/locale-state';

describe('balance summary export', () => {
  beforeEach(() => setCurrentLocaleState('ar'));

  it('includes the fund, every member, and the total in Arabic', () => {
    const summary = buildBalanceSummary(125_500, [
      { name: 'معاذ', balanceFils: 10_000 },
      { name: 'هاني', balanceFils: 20_250 },
      { name: 'حمادة', balanceFils: 30_000 },
    ]);

    expect(summary).toContain('رصيد الصندوق: 125.5 JOD');
    expect(summary).toContain('معاذ: 10 JOD');
    expect(summary).toContain('هاني: 20.25 JOD');
    expect(summary).toContain('حمادة: 30 JOD');
    expect(summary).toContain('مجموع الأرصدة الشخصية: 60.25 JOD');
  });

  it('uses the English copy and names when the app is in English', () => {
    setCurrentLocaleState('en');

    const summary = buildBalanceSummary(0, [
      { name: 'Moath', balanceFils: 0 },
      { name: 'Hani', balanceFils: 0 },
      { name: 'Hamada', balanceFils: 0 },
    ]);

    expect(summary).toContain('Fund balance: 0 JOD');
    expect(summary).toContain('Moath: 0 JOD');
    expect(summary).toContain('Hani: 0 JOD');
    expect(summary).toContain('Hamada: 0 JOD');
    expect(summary).toContain('Total personal balances: 0 JOD');
  });
});
