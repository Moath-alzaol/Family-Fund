import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAccountDeletionRequest, useRequestAccountDeletion } from '@/hooks/use-account-deletion';
import { intlLocaleTag, isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { AlertBanner } from '@/ui/alert-banner';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts } from '@/ui/theme';

export default function DeleteAccountScreen() {
  const deletionRequest = useAccountDeletionRequest();
  const requestDeletion = useRequestAccountDeletion();
  const [error, setError] = useState<string | null>(null);
  const styles = useMemo(() => createStyles(), []);

  const confirmDeletion = () => {
    Alert.alert(strings.deleteAccount.confirmTitle, strings.deleteAccount.confirmMessage, [
      { text: strings.common.back, style: 'cancel' },
      {
        text: strings.deleteAccount.confirmButton,
        style: 'destructive',
        onPress: () => {
          setError(null);
          requestDeletion.mutate(undefined, {
            onError: () => setError(strings.deleteAccount.error),
          });
        },
      },
    ]);
  };

  if (deletionRequest.isLoading) return <LoadingView />;
  if (deletionRequest.isError) return <ErrorView />;

  const pendingRequest =
    deletionRequest.data?.status === 'pending' || requestDeletion.data?.status === 'pending'
      ? (requestDeletion.data ?? deletionRequest.data)
      : null;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.deleteAccount.title} />
      <ScrollView contentContainerStyle={styles.content}>
        {pendingRequest ? (
          <Card style={styles.requestedCard}>
            <Text style={styles.requestedTitle}>{strings.deleteAccount.requestedTitle}</Text>
            <Text style={styles.bodyText}>{strings.deleteAccount.requestedMessage}</Text>
            <Text style={styles.dateText}>
              {strings.deleteAccount.requestedAt(
                new Intl.DateTimeFormat(intlLocaleTag(), { dateStyle: 'medium' }).format(
                  new Date(pendingRequest.requested_at)
                )
              )}
            </Text>
          </Card>
        ) : (
          <>
            <Text style={styles.lead}>{strings.deleteAccount.lead}</Text>
            <Card>
              <Text style={styles.bodyText}>{strings.deleteAccount.dataNotice}</Text>
              <Text style={styles.processingText}>{strings.deleteAccount.processingNotice}</Text>
            </Card>
            {error && <AlertBanner tone="bad" text={error} />}
            <Button
              label={strings.deleteAccount.requestButton}
              variant="danger"
              loading={requestDeletion.isPending}
              onPress={confirmDeletion}
            />
          </>
        )}
      </ScrollView>
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
    content: {
      padding: 20,
      paddingBottom: 60,
      gap: 18,
    },
    lead: {
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.muted,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    bodyText: {
      fontFamily: fonts.regular,
      fontSize: 13.5,
      lineHeight: 22,
      color: colors.ink,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    processingText: {
      marginTop: 14,
      fontFamily: fonts.semiBold,
      fontSize: 13,
      lineHeight: 21,
      color: colors.gold,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    requestedCard: {
      borderColor: 'rgba(74,222,128,0.35)',
    },
    requestedTitle: {
      marginBottom: 8,
      fontFamily: fonts.bold,
      fontSize: 17,
      color: colors.success,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    dateText: {
      marginTop: 12,
      fontFamily: fonts.regular,
      fontSize: 12,
      color: colors.muted,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
  });
}
