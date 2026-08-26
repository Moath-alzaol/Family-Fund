import { expect, test } from 'vitest';

import { asMoath, asUser, serviceClient } from './client';

interface AddMemberResult {
  profile: { id: string };
  username: string;
  email: string;
  temporary_password: string;
}

// Not one of the brief's numbered §6 acceptance criteria, but add_member is
// still a Phase 2 RPC — worth a smoke test now that its username generation
// changed (clean "name.name" slug, numeric suffix only on collision).
test('add_member generates a clean username and a working login', async () => {
  const moath = await asMoath();

  const result = await moath.rpc('add_member', {
    p_display_name: 'Sara Alzaol',
    p_commitment_fils: 25_000,
  });
  expect(result.error).toBeNull();
  const data = result.data as unknown as AddMemberResult;
  expect(data.username).toBe('sara.alzaol');
  expect(data.email).toBe('sara.alzaol@family-fund.local');
  expect(typeof data.temporary_password).toBe('string');

  // The generated account can actually sign in with the returned password.
  const sara = await asUser(data.email, data.temporary_password);
  const { data: session } = await sara.auth.getSession();
  expect(session.session).not.toBeNull();

  const admin = serviceClient();
  const { data: profile } = await admin.from('profiles').select('*').eq('id', data.profile.id).single();
  expect(profile?.role).toBe('member');
  expect(profile?.monthly_commitment_fils).toBe(25_000);
});

test('add_member falls back to a numeric suffix on a colliding username', async () => {
  const moath = await asMoath();

  const first = await moath.rpc('add_member', { p_display_name: 'Layla Alzaol', p_commitment_fils: 10_000 });
  expect(first.error).toBeNull();
  expect((first.data as unknown as AddMemberResult).username).toBe('layla.alzaol');

  const second = await moath.rpc('add_member', { p_display_name: 'Layla Alzaol', p_commitment_fils: 10_000 });
  expect(second.error).toBeNull();
  expect((second.data as unknown as AddMemberResult).username).toBe('layla.alzaol2');
});

test('add_member is denied for a non-admin member', async () => {
  const hani = await asUser('hani.alzaol@family-fund.local');
  const { error } = await hani.rpc('add_member', { p_display_name: 'Someone', p_commitment_fils: 10_000 });
  expect(error?.code).toBe('FFR05');
});
