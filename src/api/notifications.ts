import { supabase } from '@/api/supabase';

const NOTIFICATION_SELECT = `
  *,
  actor:profiles!notifications_actor_id_fkey(display_name, display_name_en),
  request:requests(
    type,
    auto_executed,
    requester:profiles!requests_requester_id_fkey(display_name, display_name_en)
  )
`;

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

export async function fetchNotificationById(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .is('read_at', null);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);
  if (error) throw error;
}
