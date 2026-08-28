import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import {
  fetchNotificationById,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications';
import { supabase } from '@/api/supabase';
import { notificationCopy, type NotificationKind } from '@/domain/notification';
import { localizeProfile } from '@/domain/profile';
import type { RequestType } from '@/domain/types';
import { initializeNativeNotifications, presentNativeNotification } from '@/services/native-notifications';

function localizeNotification<T extends Awaited<ReturnType<typeof fetchNotificationById>>>(notification: T) {
  return {
    ...notification,
    kind: notification.kind as NotificationKind,
    actor: notification.actor ? localizeProfile(notification.actor) : null,
    request: {
      ...notification.request,
      type: notification.request.type as RequestType,
      requester: notification.request.requester
        ? localizeProfile(notification.request.requester)
        : null,
    },
  };
}

export type AppNotification = ReturnType<typeof localizeNotification>;

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    select: (items) => items.map(localizeNotification),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useNotificationCoordinator(userId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    void initializeNativeNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (change) => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['notifications'] }),
            queryClient.invalidateQueries({ queryKey: ['requests'] }),
            queryClient.invalidateQueries({ queryKey: ['personal-balances'] }),
            queryClient.invalidateQueries({ queryKey: ['fund-balance'] }),
            queryClient.invalidateQueries({ queryKey: ['commitments'] }),
            queryClient.invalidateQueries({ queryKey: ['ledger'] }),
          ]);
          try {
            const notification = localizeNotification(await fetchNotificationById(String(change.new.id)));
            const copy = notificationCopy({
              kind: notification.kind,
              requesterName: notification.request.requester?.display_name ?? '',
              actorName: notification.actor?.display_name,
              requestType: notification.request.type,
              autoExecuted: notification.request.auto_executed,
            });
            await presentNativeNotification(copy.title, copy.body, notification.request_id);
          } catch {
            // The durable notification remains available in the notification center.
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId || Platform.OS === 'web') return;
    let active = true;
    let cleanup: (() => void) | undefined;

    void import('expo-notifications').then((Notifications) => {
      if (!active) return;
      const openRequest = (requestId: unknown) => {
        if (typeof requestId === 'string') {
          router.push({ pathname: '/request/[id]', params: { id: requestId } });
        }
      };
      const lastResponse = Notifications.getLastNotificationResponse();
      openRequest(lastResponse?.notification.request.content.data?.requestId);
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        openRequest(response.notification.request.content.data?.requestId);
      });
      cleanup = () => subscription.remove();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [router, userId]);
}
