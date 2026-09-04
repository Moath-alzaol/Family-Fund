import { supabase } from '@/api/supabase';

export async function fetchMyAccountDeletionRequest() {
  const { data, error } = await supabase
    .from('account_deletion_requests')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function requestAccountDeletion() {
  const { data, error } = await supabase.rpc('request_account_deletion');
  if (error) throw error;
  return data;
}
