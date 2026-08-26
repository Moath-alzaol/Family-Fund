import { expect, test } from 'vitest';

import { asMoath, MOATH_ID } from './client';

// Brief §8.1: admin_deposit_requires_approval must be a flippable config flag,
// not a hardcoded default. Runs after tests/acceptance.test.ts resets the DB,
// so the flag starts at its shipped default (true).
test('admin deposit respects the admin_deposit_requires_approval flag', async () => {
  const moath = await asMoath();

  const pending = await moath.rpc('create_request', { p_type: 'deposit', p_amount_fils: 50_000 });
  expect(pending.error).toBeNull();
  expect(pending.data?.status).toBe('pending');
  expect(pending.data?.auto_executed).toBe(false);

  const flipped = await moath.rpc('set_admin_deposit_requires_approval', { p_value: false });
  expect(flipped.error).toBeNull();
  expect(flipped.data?.admin_deposit_requires_approval).toBe(false);

  const autoExecuted = await moath.rpc('create_request', { p_type: 'deposit', p_amount_fils: 50_000 });
  expect(autoExecuted.error).toBeNull();
  expect(autoExecuted.data?.status).toBe('approved');
  expect(autoExecuted.data?.auto_executed).toBe(true);
  expect(autoExecuted.data?.decided_by).toBe(MOATH_ID);

  await moath.rpc('set_admin_deposit_requires_approval', { p_value: true });
});
