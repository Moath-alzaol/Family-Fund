import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/api/database.types';

// Fixed local-only `supabase start` demo credentials — safe to hardcode, they
// only ever authenticate against 127.0.0.1 and are printed by the CLI itself.
const URL = 'http://127.0.0.1:54321';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

export const SEED_PASSWORD = 'password123';
export const HANI_ID = '11111111-1111-1111-1111-111111111111';
export const MOHAMMED_ID = '22222222-2222-2222-2222-222222222222';
export const MOATH_ID = '33333333-3333-3333-3333-333333333333';

export function serviceClient() {
  return createClient<Database>(URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function asUser(email: string, password: string = SEED_PASSWORD) {
  const client = createClient<Database>(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

export const asHani = () => asUser('hani.alzaol@family-fund.local');
export const asMohammed = () => asUser('hamada.alzaol@family-fund.local');
export const asMoath = () => asUser('moath.alzaol@family-fund.local');

export async function personalBalance(client: ReturnType<typeof serviceClient>, profileId: string) {
  const { data, error } = await client.from('v_personal_balances').select('*').eq('profile_id', profileId).single();
  if (error) throw error;
  return data.balance_fils ?? 0;
}

export async function fundBalance(client: ReturnType<typeof serviceClient>) {
  const { data, error } = await client.from('v_fund_balance').select('*').single();
  if (error) throw error;
  return data.balance_fils ?? 0;
}

// Brings a profile's ledger to exactly `targetFils` via a single offsetting
// adjustment row, so each test can set up the precondition its criterion
// describes without depending on other tests' side effects.
export async function setPersonalBalance(
  admin: ReturnType<typeof serviceClient>,
  profileId: string,
  targetFils: number
) {
  const current = await personalBalance(admin, profileId);
  const delta = targetFils - current;
  if (delta === 0) return;
  const { error } = await admin.from('ledger_entries').insert({
    account_type: 'personal',
    account_owner: profileId,
    amount_fils: delta,
    entry_type: 'adjustment',
    description: 'test setup adjustment',
  });
  if (error) throw error;
}

export async function setFundBalance(admin: ReturnType<typeof serviceClient>, targetFils: number) {
  const current = await fundBalance(admin);
  const delta = targetFils - current;
  if (delta === 0) return;
  const { error } = await admin.from('ledger_entries').insert({
    account_type: 'fund',
    account_owner: null,
    amount_fils: delta,
    entry_type: 'adjustment',
    description: 'test setup adjustment',
  });
  if (error) throw error;
}
