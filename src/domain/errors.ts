import { strings } from '@/i18n/strings';

export type RuleErrorCode =
  | 'insufficient_personal_balance'
  | 'insufficient_balance_for_contribution'
  | 'commitment_not_payable'
  | 'insufficient_fund_balance'
  | 'admin_only'
  | 'invalid_input'
  | 'invalid_request_state'
  | 'not_authenticated'
  | 'unknown';

const PG_CODE_TO_RULE: Record<string, RuleErrorCode> = {
  FFR01: 'insufficient_personal_balance',
  FFR02: 'insufficient_balance_for_contribution',
  FFR03: 'commitment_not_payable',
  FFR04: 'insufficient_fund_balance',
  FFR05: 'admin_only',
  FFR06: 'invalid_input',
  FFR07: 'invalid_request_state',
  FFR08: 'not_authenticated',
};

export class RuleError extends Error {
  readonly code: RuleErrorCode;

  constructor(code: RuleErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

interface PostgrestLikeError {
  code?: string;
  message: string;
}

export function toRuleError(error: PostgrestLikeError): RuleError {
  const code = (error.code && PG_CODE_TO_RULE[error.code]) || 'unknown';
  return new RuleError(code, error.message);
}

const RULE_TO_STRINGS_KEY: Record<RuleErrorCode, keyof typeof strings.errors> = {
  insufficient_personal_balance: 'insufficientPersonalBalance',
  insufficient_balance_for_contribution: 'insufficientBalanceForContribution',
  commitment_not_payable: 'commitmentNotPayable',
  insufficient_fund_balance: 'insufficientFundBalance',
  admin_only: 'adminOnly',
  invalid_input: 'invalidInput',
  invalid_request_state: 'invalidRequestState',
  not_authenticated: 'notAuthenticated',
  unknown: 'unknown',
};

// The server's raised message is always Arabic (it's generated in SQL, with
// no notion of the client's UI language) — RPC errors carry a stable code
// (FFR01-08) precisely so the client can render a fully localized message
// instead of ever showing that raw text to the user.
export function localizeError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const ruleError = toRuleError(error as PostgrestLikeError);
    return strings.errors[RULE_TO_STRINGS_KEY[ruleError.code]];
  }
  return strings.errors.unknown;
}
