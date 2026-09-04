import { execSync } from 'node:child_process';
import { beforeAll, describe, expect, test } from 'vitest';

import {
  anonymousClient,
  asHani,
  asMoath,
  asMohammed,
  fundBalance,
  HANI_ID,
  MOATH_ID,
  MOHAMMED_ID,
  personalBalance,
  serviceClient,
  setFundBalance,
  setPersonalBalance,
} from './client';

const PERIOD = '2026-08-01';

beforeAll(() => {
  execSync('supabase db reset', { stdio: 'inherit' });
}, 60000);

// §6.1 — a withdrawal may exceed the personal balance and becomes negative on approval.
test('1. withdrawal over balance is allowed and creates a negative personal balance', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();

  const created = await hani.rpc('create_request', {
    p_type: 'withdrawal',
    p_amount_fils: 500_000,
  });

  expect(created.error).toBeNull();
  const moath = await asMoath();
  const approved = await moath.rpc('approve_request', { p_request_id: created.data!.id });
  expect(approved.error).toBeNull();
  expect(await personalBalance(admin, HANI_ID)).toBe(-100_000);
});

// §6.2 — a valid withdrawal request is created pending, balance untouched.
test('2. withdrawal within balance is created pending, balance unchanged until approval', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();

  const { data, error } = await hani.rpc('create_request', {
    p_type: 'withdrawal',
    p_amount_fils: 300_000,
  });

  expect(error).toBeNull();
  expect(data?.status).toBe('pending');
  expect(data?.amount_fils).toBe(300_000);
  expect(await personalBalance(admin, HANI_ID)).toBe(400_000);
});

// §6.3 — approving moves the money exactly once and stamps the decision.
test('3. approving a pending withdrawal debits the balance and stamps the decision', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();
  const moath = await asMoath();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 300_000 });
  const requestId = created.data!.id;

  const { data, error } = await moath.rpc('approve_request', { p_request_id: requestId });

  expect(error).toBeNull();
  expect(data?.status).toBe('approved');
  expect(data?.decided_by).toBe(MOATH_ID);
  expect(data?.decided_at).not.toBeNull();
  expect(await personalBalance(admin, HANI_ID)).toBe(100_000);

  const { data: ledgerRows } = await admin.from('ledger_entries').select('*').eq('request_id', requestId);
  expect(ledgerRows).toHaveLength(1);
});

// §6.4 — rejection never moves money and records the reason.
test('4. rejecting a pending withdrawal moves no money and stores the reason', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();
  const moath = await asMoath();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 300_000 });
  const requestId = created.data!.id;

  const { data, error } = await moath.rpc('reject_request', {
    p_request_id: requestId,
    p_reason: 'نحتاج نأجل السحب لآخر الشهر',
  });

  expect(error).toBeNull();
  expect(data?.status).toBe('rejected');
  expect(data?.rejection_reason).toBe('نحتاج نأجل السحب لآخر الشهر');
  expect(await personalBalance(admin, HANI_ID)).toBe(400_000);

  const { data: ledgerRows } = await admin.from('ledger_entries').select('*').eq('request_id', requestId);
  expect(ledgerRows).toHaveLength(0);
});

// §6.5 — an empty rejection reason is rejected outright.
test('5. rejecting with an empty reason errors', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();
  const moath = await asMoath();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 100_000 });
  const requestId = created.data!.id;

  const { error } = await moath.rpc('reject_request', { p_request_id: requestId, p_reason: '   ' });

  expect(error?.code).toBe('FFR06');
});

// §6.6 — a full contribution may overdraw the personal balance; partial payment stays disallowed.
test('6. full contribution can create a negative personal balance', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, MOHAMMED_ID, 30_000);
  await admin.rpc('ensure_commitments_for_period', { p_period: PERIOD });
  const mohammed = await asMohammed();

  const created = await mohammed.rpc('create_request', {
    p_type: 'contribution',
    p_amount_fils: 50_000,
    p_period: PERIOD,
  });

  expect(created.error).toBeNull();
  const moath = await asMoath();
  const approved = await moath.rpc('approve_request', { p_request_id: created.data!.id });
  expect(approved.error).toBeNull();
  expect(await personalBalance(admin, MOHAMMED_ID)).toBe(-20_000);

  const { data: commitment } = await admin
    .from('commitments')
    .select('*')
    .eq('profile_id', MOHAMMED_ID)
    .eq('period', PERIOD)
    .single();
  expect(commitment?.paid_fils).toBe(50_000);
});

// §6.7 — approving a contribution writes both ledger legs and marks it paid.
test('7. approving a contribution writes two ledger rows and marks the commitment paid', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, MOHAMMED_ID, 200_000);
  await admin.rpc('ensure_commitments_for_period', { p_period: PERIOD });
  const mohammed = await asMohammed();
  const moath = await asMoath();

  const created = await mohammed.rpc('create_request', {
    p_type: 'contribution',
    p_amount_fils: 50_000,
    p_period: PERIOD,
  });
  expect(created.error).toBeNull();
  const requestId = created.data!.id;

  const fundBefore = await fundBalance(admin);
  const { error } = await moath.rpc('approve_request', { p_request_id: requestId });
  expect(error).toBeNull();

  const { data: ledgerRows } = await admin.from('ledger_entries').select('*').eq('request_id', requestId);
  expect(ledgerRows).toHaveLength(2);
  expect(await personalBalance(admin, MOHAMMED_ID)).toBe(150_000);
  expect(await fundBalance(admin)).toBe(fundBefore + 50_000);

  const { data: commitment } = await admin
    .from('commitments')
    .select('*')
    .eq('profile_id', MOHAMMED_ID)
    .eq('period', PERIOD)
    .single();
  expect(commitment?.paid_fils).toBe(50_000);
  expect(commitment?.required_fils).toBe(commitment?.paid_fils);
});

// §6.8 — members can never approve, even someone else's request.
test('8. a member calling approve_request on someone else\'s request is denied', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();
  const mohammed = await asMohammed();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 100_000 });
  const requestId = created.data!.id;

  const { error } = await mohammed.rpc('approve_request', { p_request_id: requestId });
  expect(error?.code).toBe('FFR05');
});

// §6.9 — members can never approve, not even their own request.
test('9. a member calling approve_request on their own request is denied', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 100_000 });
  const requestId = created.data!.id;

  const { error } = await hani.rpc('approve_request', { p_request_id: requestId });
  expect(error?.code).toBe('FFR05');
});

// §6.10 — the admin's own withdrawal auto-executes with no pending state.
test('10. admin withdrawal within balance auto-executes', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, MOATH_ID, 500_000);
  const moath = await asMoath();

  const { data, error } = await moath.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 100_000 });

  expect(error).toBeNull();
  expect(data?.status).toBe('approved');
  expect(data?.auto_executed).toBe(true);
  expect(data?.decided_by).toBe(MOATH_ID);
  expect(await personalBalance(admin, MOATH_ID)).toBe(400_000);
});

// §6.11 — an approved expense may overdraw the fund and only touches the fund.
test('11. expense can overdraw the fund while personal balances remain unchanged', async () => {
  const admin = serviceClient();
  await setFundBalance(admin, 200_000);
  await setPersonalBalance(admin, HANI_ID, 400_000);
  const hani = await asHani();
  const moath = await asMoath();

  const created = await hani.rpc('create_request', {
    p_type: 'expense',
    p_amount_fils: 350_000,
    p_beneficiary: 'صيانة البيت',
  });
  expect(created.error).toBeNull();

  const balanceBeforeApproval = await personalBalance(admin, HANI_ID);
  const { error } = await moath.rpc('approve_request', { p_request_id: created.data!.id });
  expect(error).toBeNull();

  expect(await fundBalance(admin)).toBe(-150_000);
  expect(await personalBalance(admin, HANI_ID)).toBe(balanceBeforeApproval);
});

// §6.12 — approval remains valid even if the personal balance drops after creation.
test('12. approval can overdraw a balance that dropped after request creation', async () => {
  const admin = serviceClient();
  await setPersonalBalance(admin, HANI_ID, 500_000);
  const hani = await asHani();
  const moath = await asMoath();

  const created = await hani.rpc('create_request', { p_type: 'withdrawal', p_amount_fils: 400_000 });
  expect(created.error).toBeNull();
  const requestId = created.data!.id;

  await setPersonalBalance(admin, HANI_ID, 100_000);

  const { error } = await moath.rpc('approve_request', { p_request_id: requestId });
  expect(error).toBeNull();

  const { data: request } = await admin.from('requests').select('*').eq('id', requestId).single();
  expect(request?.status).toBe('approved');
  expect(await personalBalance(admin, HANI_ID)).toBe(-300_000);
});

// §6.13 — RLS denies any direct client mutation of ledger_entries.
test('13. direct insert/update/delete on ledger_entries is denied by RLS for any authenticated client', async () => {
  const admin = serviceClient();
  const hani = await asHani();

  const insert = await hani.from('ledger_entries').insert({
    account_type: 'personal',
    account_owner: HANI_ID,
    amount_fils: 1,
    entry_type: 'adjustment',
    description: 'should not be allowed',
  });
  expect(insert.error).not.toBeNull();

  const { data: anyRow } = await admin.from('ledger_entries').select('id').limit(1).single();
  const update = await hani.from('ledger_entries').update({ description: 'tampered' }).eq('id', anyRow!.id);
  expect(update.error).not.toBeNull();

  const del = await hani.from('ledger_entries').delete().eq('id', anyRow!.id);
  expect(del.error).not.toBeNull();
});

// §6.14 — the ledger is always the source of truth behind the derived balances.
describe('14. derived balances always equal the sum of their ledger entries', () => {
  test('personal balances', async () => {
    const admin = serviceClient();
    const { data: profiles } = await admin.from('profiles').select('id');
    for (const p of profiles ?? []) {
      const { data: rows } = await admin.from('ledger_entries').select('amount_fils').eq('account_owner', p.id);
      const sum = (rows ?? []).reduce((s, r) => s + r.amount_fils, 0);
      expect(await personalBalance(admin, p.id)).toBe(sum);
    }
  });

  test('fund balance', async () => {
    const admin = serviceClient();
    const { data: rows } = await admin.from('ledger_entries').select('amount_fils').eq('account_type', 'fund');
    const sum = (rows ?? []).reduce((s, r) => s + r.amount_fils, 0);
    expect(await fundBalance(admin)).toBe(sum);
  });
});

// App Store account-deletion requirement — users initiate in-app and can only
// read the status of their own request while an operator completes the process.
test('15. account deletion requests are created directly and remain private', async () => {
  const anonymousRequest = await anonymousClient().rpc('request_account_deletion');
  expect(anonymousRequest.error).not.toBeNull();

  const hani = await asHani();
  const mohammed = await asMohammed();

  const directInsert = await hani.from('account_deletion_requests').insert({ user_id: HANI_ID });
  expect(directInsert.error).not.toBeNull();

  const created = await hani.rpc('request_account_deletion');
  expect(created.error).toBeNull();
  expect(created.data?.user_id).toBe(HANI_ID);
  expect(created.data?.status).toBe('pending');

  const ownRequest = await hani.from('account_deletion_requests').select('*').single();
  expect(ownRequest.error).toBeNull();
  expect(ownRequest.data?.user_id).toBe(HANI_ID);

  const otherUsersRequests = await mohammed.from('account_deletion_requests').select('*');
  expect(otherUsersRequests.error).toBeNull();
  expect(otherUsersRequests.data).toHaveLength(0);
});
