import { supabase } from '@/api/supabase';
import type { RequestType } from '@/domain/types';

export interface CreateRequestInput {
  type: RequestType;
  amountFils: number;
  reason?: string;
  beneficiary?: string;
  period?: string;
}

export async function createRequest(input: CreateRequestInput) {
  const { data, error } = await supabase.rpc('create_request', {
    p_type: input.type,
    p_amount_fils: input.amountFils,
    p_reason: input.reason,
    p_beneficiary: input.beneficiary,
    p_period: input.period,
  });
  if (error) throw error;
  return data;
}

export async function approveRequest(requestId: string) {
  const { data, error } = await supabase.rpc('approve_request', { p_request_id: requestId });
  if (error) throw error;
  return data;
}

export async function rejectRequest(requestId: string, reason: string) {
  const { data, error } = await supabase.rpc('reject_request', { p_request_id: requestId, p_reason: reason });
  if (error) throw error;
  return data;
}

export async function addMember(displayName: string, commitmentFils: number) {
  const { data, error } = await supabase.rpc('add_member', {
    p_display_name: displayName,
    p_commitment_fils: commitmentFils,
  });
  if (error) throw error;
  return data as {
    profile: { id: string; display_name: string };
    username: string;
    email: string;
    temporary_password: string;
  };
}

export async function setAdminDepositRequiresApproval(value: boolean) {
  const { data, error } = await supabase.rpc('set_admin_deposit_requires_approval', { p_value: value });
  if (error) throw error;
  return data;
}
