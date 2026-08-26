import { strings } from '@/i18n/strings';

interface LedgerEntryLike {
  entry_type: string;
  account_type: string;
  description: string;
  request?: { beneficiary: string | null; requester: { display_name: string } | null } | null;
}

// The stored `description` column is written once, server-side, in whatever
// language happened to be baked into the SQL at the time — it's a fine
// historical record but not something that should follow the viewer's
// current UI language. This derives a display label from the structured
// data instead, so it's always shown in the active locale.
export function describeLedgerEntry(entry: LedgerEntryLike): string {
  switch (entry.entry_type) {
    case 'deposit':
      return strings.ledgerEntry.deposit;
    case 'withdrawal':
      return strings.ledgerEntry.withdrawal;
    case 'contribution':
      return entry.account_type === 'fund'
        ? strings.ledgerEntry.contributionFund(entry.request?.requester?.display_name ?? '')
        : strings.ledgerEntry.contributionPersonal;
    case 'expense':
      return strings.ledgerEntry.expense(entry.request?.beneficiary || entry.description);
    case 'opening_balance':
      return strings.ledgerEntry.openingBalance;
    case 'adjustment':
      return strings.ledgerEntry.adjustment;
    default:
      return entry.description;
  }
}
