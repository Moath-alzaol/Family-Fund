import { formatJod } from '@/domain/money';
import type { RequestType } from '@/domain/types';
import { strings } from '@/i18n/strings';

export interface ContributionContext {
  dueFils: number;
}

// Mirrors create_request's checks (supabase/migrations/20260101000004_app_settings.sql)
// for instant feedback. The server re-validates independently — this is a UX
// convenience only, never the enforcement point.
export function validateRequestAmount(
  type: RequestType,
  amountFils: number | null,
  balanceFils: number,
  fundFils: number,
  contribution?: ContributionContext
): string | null {
  if (!amountFils || amountFils <= 0) {
    return strings.validation.amountRequired;
  }

  if (type === 'withdrawal' && amountFils > balanceFils) {
    return strings.validation.withdrawalInsufficient(formatJod(balanceFils));
  }

  if (type === 'contribution' && contribution) {
    if (contribution.dueFils <= 0) {
      return strings.validation.contributionAlreadyPaid;
    }
    if (amountFils > balanceFils) {
      return strings.validation.contributionInsufficientBalance(formatJod(balanceFils));
    }
    if (amountFils !== contribution.dueFils) {
      return strings.validation.contributionAmountMismatch(formatJod(contribution.dueFils));
    }
  }

  if (type === 'expense' && amountFils > fundFils) {
    return strings.validation.expenseInsufficientFund(formatJod(fundFils));
  }

  return null;
}
