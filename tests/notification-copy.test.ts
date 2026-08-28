import { beforeEach, describe, expect, test } from 'vitest';

import { notificationCopy } from '@/domain/notification';
import { setCurrentLocaleState } from '@/i18n/locale-state';

describe('notificationCopy', () => {
  beforeEach(() => setCurrentLocaleState('ar'));

  test('describes a new request for all recipients', () => {
    expect(
      notificationCopy({
        kind: 'request_created',
        requesterName: 'هاني',
        requestType: 'withdrawal',
      })
    ).toEqual({
      title: 'طلب جديد',
      body: 'هاني أرسل طلب سحب شخصي',
    });
  });

  test('describes the approval to the requester', () => {
    expect(
      notificationCopy({
        kind: 'request_approved',
        requesterName: 'هاني',
        actorName: 'معاذ',
        requestType: 'contribution',
      })
    ).toEqual({
      title: 'تم اعتماد طلبك',
      body: 'معاذ اعتمد طلب دفع الالتزام الشهري',
    });
  });

  test('uses the current English locale', () => {
    setCurrentLocaleState('en');
    expect(
      notificationCopy({
        kind: 'request_rejected',
        requesterName: 'Hani',
        actorName: 'Moath',
        requestType: 'expense',
      })
    ).toEqual({
      title: 'Your request was rejected',
      body: 'Moath rejected your Fund Expense request',
    });
  });
});
