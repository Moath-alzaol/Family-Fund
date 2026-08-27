import { supabase } from '@/api/supabase';
import type { RequestStatus, RequestType } from '@/domain/types';

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchPersonalBalances() {
  const { data, error } = await supabase.from('v_personal_balances').select('*');
  if (error) throw error;
  return data;
}

export async function fetchFundBalance() {
  const { data, error } = await supabase.from('v_fund_balance').select('*').single();
  if (error) throw error;
  return data.balance_fils ?? 0;
}

export async function fetchRequests(status?: RequestStatus) {
  let query = supabase
    .from('requests')
    .select('*, requester:profiles!requests_requester_id_fkey(display_name, display_name_en, role)')
    .order('created_at', { ascending: false });
  if (status) {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map((r) => ({ ...r, type: r.type as RequestType, status: r.status as RequestStatus }));
}

export async function fetchLedger(accountType: 'personal' | 'fund', accountOwner?: string) {
  let query = supabase
    .from('ledger_entries')
    .select('*, request:requests(beneficiary, requester:profiles!requests_requester_id_fkey(display_name, display_name_en))')
    .eq('account_type', accountType)
    .order('occurred_at', { ascending: true });
  if (accountOwner) {
    query = query.eq('account_owner', accountOwner);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchCommitments(period: string) {
  const { error: ensureError } = await supabase.rpc('ensure_commitments_for_period', { p_period: period });
  if (ensureError) throw ensureError;

  const { data, error } = await supabase.from('commitments').select('*').eq('period', period);
  if (error) throw error;
  return data;
}

export async function fetchRequestById(id: string) {
  const { data, error } = await supabase
    .from('requests')
    .select(
      '*, requester:profiles!requests_requester_id_fkey(display_name, display_name_en, role), decider:profiles!requests_decided_by_fkey(display_name, display_name_en)'
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return { ...data, type: data.type as RequestType, status: data.status as RequestStatus };
}

export async function fetchAppSettings() {
  const { data, error } = await supabase.from('app_settings').select('*').single();
  if (error) throw error;
  return data;
}
