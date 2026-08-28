import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { notificationCopy, type NotificationKind } from '@/domain/notification';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications';
import { intlLocaleTag, isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { BellIcon, CheckIcon } from '@/ui/icons';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

const KIND_COLOR: Record<NotificationKind, string> = {
  request_created: colors.gold,
  request_approved: colors.success,
  request_rejected: colors.danger,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const styles = useMemo(() => createStyles(), []);

  if (notifications.isLoading) return <LoadingView />;
  if (notifications.isError) return <ErrorView />;

  const items = notifications.data ?? [];
  const hasUnread = items.some((item) => !item.read_at);

  const openNotification = async (id: string, requestId: string, isUnread: boolean) => {
    if (isUnread) await markRead.mutateAsync(id);
    router.push({ pathname: '/request/[id]', params: { id: requestId } });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.notifications.title} />
      {hasUnread && (
        <TouchableOpacity
          style={styles.markAllButton}
          disabled={markAllRead.isPending}
          onPress={() => markAllRead.mutate()}
        >
          <CheckIcon size={14} color={colors.gold} strokeWidth={3} />
          <Text style={styles.markAllText}>{strings.notifications.markAllRead}</Text>
        </TouchableOpacity>
      )}

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <BellIcon size={30} color={colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>{strings.notifications.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{strings.notifications.emptySubtitle}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => {
            const copy = notificationCopy({
              kind: item.kind,
              requesterName: item.request.requester?.display_name ?? '',
              actorName: item.actor?.display_name,
              requestType: item.request.type,
              autoExecuted: item.request.auto_executed,
            });
            const unread = !item.read_at;
            const date = new Intl.DateTimeFormat(intlLocaleTag(), {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(item.created_at));

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, unread && styles.itemUnread]}
                onPress={() => void openNotification(item.id, item.request_id, unread)}
              >
                <View style={[styles.kindIcon, { backgroundColor: `${KIND_COLOR[item.kind]}20` }]}>
                  <BellIcon size={19} color={KIND_COLOR[item.kind]} strokeWidth={2} />
                </View>
                <View style={styles.itemBody}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{copy.title}</Text>
                    {unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.itemText}>{copy.body}</Text>
                  <Text style={styles.itemDate}>{date}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: {
      flex: 1,
      direction: 'ltr',
      backgroundColor: colors.bg,
    },
    markAllButton: {
      marginHorizontal: 20,
      marginBottom: 12,
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      alignItems: 'center',
      alignSelf: isRTL() ? 'flex-end' : 'flex-start',
      gap: 7,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    markAllText: {
      color: colors.gold,
      fontFamily: fonts.semiBold,
      fontSize: 12,
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 10,
    },
    item: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: 13,
      padding: 15,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    itemUnread: {
      borderColor: 'rgba(201,168,76,0.38)',
      backgroundColor: colors.goldDim,
    },
    kindIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemBody: {
      flex: 1,
    },
    itemTitleRow: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemTitle: {
      flex: 1,
      color: colors.ink,
      fontFamily: fonts.bold,
      fontSize: 14,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gold,
    },
    itemText: {
      color: colors.muted,
      fontFamily: fonts.regular,
      fontSize: 12.5,
      lineHeight: 20,
      marginTop: 3,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    itemDate: {
      color: colors.muted,
      fontFamily: fonts.regular,
      fontSize: 10.5,
      marginTop: 6,
      textAlign: isRTL() ? 'right' : 'left',
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 36,
      paddingBottom: 80,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    emptyTitle: {
      color: colors.ink,
      fontFamily: fonts.bold,
      fontSize: 18,
      textAlign: 'center',
    },
    emptySubtitle: {
      color: colors.muted,
      fontFamily: fonts.regular,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 6,
      textAlign: 'center',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
  });
}
