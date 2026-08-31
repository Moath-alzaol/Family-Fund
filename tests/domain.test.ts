import { describe, expect, test } from 'vitest';

import { usernameToAuthEmail } from '@/domain/auth';
import { filsToJod, formatJod, jodToFils } from '@/domain/money';
import { validateRequestAmount } from '@/domain/validation';

describe('usernameToAuthEmail', () => {
  test('appends the fixed domain to a bare username', () => {
    expect(usernameToAuthEmail('moath.alzaol')).toBe('moath.alzaol@family-fund.local');
  });

  test('leaves a value that already looks like an email untouched', () => {
    expect(usernameToAuthEmail('someone@example.com')).toBe('someone@example.com');
  });

  test('trims surrounding whitespace before checking for "@"', () => {
    expect(usernameToAuthEmail('  hani.alzaol  ')).toBe('hani.alzaol@family-fund.local');
  });
});

describe('money conversions', () => {
  test('jodToFils rounds to the nearest fils', () => {
    expect(jodToFils(100)).toBe(100_000);
    expect(jodToFils(0.4)).toBe(400);
  });

  test('filsToJod is the inverse of jodToFils', () => {
    expect(filsToJod(100_000)).toBe(100);
  });

  test('formatJod trims a whole-JOD amount to no decimals', () => {
    expect(formatJod(400_000)).toBe('400');
  });

  test('formatJod keeps a fractional JOD amount', () => {
    expect(formatJod(400_500)).toBe('400.5');
  });
});

describe('validateRequestAmount', () => {
  test('rejects a zero or missing amount', () => {
    expect(validateRequestAmount('deposit', 0, 100_000, 100_000)).not.toBeNull();
    expect(validateRequestAmount('deposit', null, 100_000, 100_000)).not.toBeNull();
  });

  test('allows a withdrawal larger than the personal balance', () => {
    expect(validateRequestAmount('withdrawal', 500_000, 400_000, 0)).toBeNull();
  });

  test('allows a withdrawal within the personal balance', () => {
    expect(validateRequestAmount('withdrawal', 300_000, 400_000, 0)).toBeNull();
  });

  test('blocks a contribution when the commitment is already fully paid', () => {
    expect(
      validateRequestAmount('contribution', 50_000, 200_000, 0, { dueFils: 0 })
    ).not.toBeNull();
  });

  test('allows a full contribution even when it makes the personal balance negative', () => {
    expect(
      validateRequestAmount('contribution', 50_000, 30_000, 0, { dueFils: 50_000 })
    ).toBeNull();
  });

  test('blocks a contribution amount that does not match what is due', () => {
    expect(
      validateRequestAmount('contribution', 30_000, 200_000, 0, { dueFils: 50_000 })
    ).not.toBeNull();
  });

  test('allows a contribution that exactly matches what is due and is covered by the balance', () => {
    expect(
      validateRequestAmount('contribution', 50_000, 200_000, 0, { dueFils: 50_000 })
    ).toBeNull();
  });

  test('allows an expense larger than the fund balance', () => {
    expect(validateRequestAmount('expense', 300_000, 0, 200_000)).toBeNull();
  });

  test('allows an expense within the fund balance', () => {
    expect(validateRequestAmount('expense', 150_000, 0, 200_000)).toBeNull();
  });
});
