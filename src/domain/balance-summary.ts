import { formatJod } from '@/domain/money';
import { strings } from '@/i18n/strings';

export interface BalanceSummaryMember {
  name: string;
  balanceFils: number;
}

export function buildBalanceSummary(fundBalanceFils: number, members: BalanceSummaryMember[]): string {
  const memberLines = members.map(
    ({ name, balanceFils }) => `${name}: ${formatJod(balanceFils)} ${strings.common.currency}`
  );
  const totalPersonalFils = members.reduce((total, member) => total + member.balanceFils, 0);

  return [
    strings.home.balanceSummaryTitle,
    '',
    `${strings.home.fundBalanceSummaryLabel}: ${formatJod(fundBalanceFils)} ${strings.common.currency}`,
    ...memberLines,
    '',
    `${strings.home.totalPersonalBalancesLabel}: ${formatJod(totalPersonalFils)} ${strings.common.currency}`,
  ].join('\n');
}
