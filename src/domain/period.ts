import { intlLocaleTag } from '@/i18n/locale-state';

export const APP_TIMEZONE = 'Asia/Amman';

export function currentPeriod(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  return `${year}-${month}-01`;
}

export function formatPeriodLabel(period: string): string {
  const date = new Date(`${period}T00:00:00Z`);
  return new Intl.DateTimeFormat(intlLocaleTag(), {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'long',
  }).format(date);
}
