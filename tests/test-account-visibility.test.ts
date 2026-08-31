import { expect, test } from 'vitest';

import { APP_TEST_USER_ID, asAppTestUser, asHani, serviceClient } from './client';

test('regular family members do not see the app test account', async () => {
  const hani = await asHani();
  const { data, error } = await hani.from('profiles').select('id');

  expect(error).toBeNull();
  expect(data).toHaveLength(3);
  expect(data?.some((profile) => profile.id === APP_TEST_USER_ID)).toBe(false);
});

test('the app test account remains active and can read its own profile', async () => {
  const appTestUser = await asAppTestUser();
  const { data, error } = await appTestUser.from('profiles').select('id').eq('id', APP_TEST_USER_ID).single();

  expect(error).toBeNull();
  expect(data?.id).toBe(APP_TEST_USER_ID);
});

test('trusted operations can still identify the account as a test account', async () => {
  const admin = serviceClient();
  const { data, error } = await admin
    .from('profiles')
    .select('is_test_account')
    .eq('id', APP_TEST_USER_ID)
    .single();

  expect(error).toBeNull();
  expect(data?.is_test_account).toBe(true);
});
