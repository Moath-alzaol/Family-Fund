import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { describeLedgerEntry } from '@/domain/ledger';
import { formatJod } from '@/domain/money';
import { currentPeriod } from '@/domain/period';
import { usePersonalBalances } from '@/hooks/use-balances';
import { useCommitments } from '@/hooks/use-commitments';
import { useLedger } from '@/hooks/use-ledger';
import { useMyProfile, useProfiles } from '@/hooks/use-profiles';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Avatar } from '@/ui/avatar';
import { Card } from '@/ui/card';
import { LedgerRow } from '@/ui/ledger-row';
import { MoneyText } from '@/ui/money-text';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts } from '@/ui/theme';

export default function BalancesScreen() {
  const myProfile = useMyProfile();
  const profiles = useProfiles();
  const balances = usePersonalBalances();
  const commitments = useCommitments(currentPeriod());
  const ledger = useLedger('personal', myProfile.data?.id);
  const styles = useMemo(() => createStyles(), []);

  if (myProfile.isLoading || profiles.isLoading || balances.isLoading) return <LoadingView />;
  if (myProfile.isError || profiles.isError || balances.isError) return <ErrorView />;
  if (!myProfile.data) return null;

  const balanceOf = (id: string) => balances.data?.find((b) => b.profile_id === id)?.balance_fils ?? 0;
  const approvedHistory = (ledger.data ?? []).filter(Boolean).slice(-12).reverse();
  const others = (profiles.data ?? []).filter((p) => p.id !== myProfile.data!.id);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.balances.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Avatar name={myProfile.data.display_name} id={myProfile.data.id} size={52} radius={16} fontSize={22} />
            <View>
              <Text style={styles.heroLabel}>{strings.balances.yourBalanceLabel}</Text>
              <Text style={styles.heroName}>{myProfile.data.display_name}</Text>
            </View>
          </View>
          <View style={styles.heroAmountRow}>
            <MoneyText style={styles.heroAmount}>{formatJod(balanceOf(myProfile.data.id))}</MoneyText>
            <Text style={styles.heroCurrency}>{strings.common.currency}</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.balances.historyLabel}</Text>
          {approvedHistory.length > 0 ? (
            approvedHistory.map((entry, i) => (
              <LedgerRow
                key={entry.id}
                entry={{ id: entry.id, description: describeLedgerEntry(entry), occurredAt: entry.occurred_at, amountFils: entry.amount_fils }}
                bordered={i < approvedHistory.length - 1}
              />
            ))
          ) : (
            <Text style={styles.empty}>{strings.balances.emptyHistory}</Text>
          )}
        </Card>

        <Text style={styles.sectionTitleStandalone}>{strings.balances.brothersLabel}</Text>
        {others.map((p) => {
          const c = commitments.data?.find((x) => x.profile_id === p.id);
          const paid = c ? c.paid_fils >= c.required_fils : false;
          const due = c ? c.required_fils - c.paid_fils : p.monthly_commitment_fils;
          return (
            <Card key={p.id} style={styles.card}>
              <View style={styles.brotherRow}>
                <Avatar name={p.display_name} id={p.id} size={54} radius={17} fontSize={22} />
                <View style={styles.brotherMiddle}>
                  <View style={styles.brotherNameRow}>
                    <Text style={styles.brotherName}>{p.display_name}</Text>
                    {p.role === 'admin' && (
                      <View style={styles.adminPill}>
                        <Text style={styles.adminPillText}>{strings.role.admin}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.brotherStatus, { color: paid ? colors.success : colors.danger }]}>
                    {paid ? strings.balances.paidThisMonthCheck : strings.balances.notPaidRemaining(formatJod(due))}
                  </Text>
                </View>
                <View style={styles.brotherTrailing}>
                  <MoneyText style={styles.brotherAmount}>{formatJod(balanceOf(p.id))}</MoneyText>
                  <Text style={styles.brotherUnit}>{strings.common.currency}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

// isRTL() must be read inside this factory (called at render time), not at
// module scope — StyleSheet.create only runs once, on first import, which
// happens before the app finishes loading the saved language preference.
function createStyles() {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#0C1D3A',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.22)',
    borderRadius: 24,
    padding: 24,
  },
  heroTop: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  heroLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
    textAlign: isRTL() ? 'right' : 'left',
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  heroAmount: {
    fontSize: 44,
    color: colors.ink,
    lineHeight: 55,
  },
  heroCurrency: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
    marginBottom: 4,
  },
  card: {
    marginBottom: 0,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 16,
    textAlign: isRTL() ? 'right' : 'left',
  },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    paddingVertical: 28,
  },
  sectionTitleStandalone: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: isRTL() ? 'right' : 'left',
  },
  brotherRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 16,
  },
  brotherMiddle: {
    flex: 1,
  },
  brotherNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  brotherName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  adminPill: {
    paddingVertical: 1,
    paddingHorizontal: 7,
    borderRadius: 100,
    backgroundColor: colors.goldDim,
  },
  adminPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.gold,
  },
  brotherStatus: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: isRTL() ? 'right' : 'left',
  },
  brotherTrailing: {
    alignItems: 'flex-end',
  },
  brotherAmount: {
    fontSize: 22,
    color: colors.ink,
    lineHeight: 28,
  },
  brotherUnit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  });
}
