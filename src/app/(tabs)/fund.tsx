import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { describeLedgerEntry } from '@/domain/ledger';
import { formatJod } from '@/domain/money';
import { currentPeriod, formatPeriodLabel } from '@/domain/period';
import { useFundBalance } from '@/hooks/use-balances';
import { useLedger } from '@/hooks/use-ledger';
import { useProfiles } from '@/hooks/use-profiles';
import { useCommitments } from '@/hooks/use-commitments';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Card } from '@/ui/card';
import { LedgerRow } from '@/ui/ledger-row';
import { MoneyText } from '@/ui/money-text';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { colors, fonts, radii } from '@/ui/theme';

type SubTab = 'activity' | 'report';

function periodEnd(period: string) {
  const [year, month] = period.split('-').map(Number);
  return month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

export default function FundScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<SubTab>('activity');

  const period = currentPeriod();
  const end = periodEnd(period);
  const fund = useFundBalance();
  const fundLedger = useLedger('fund');
  const profiles = useProfiles();
  const commitments = useCommitments(period);
  const styles = useMemo(() => createStyles(), []);

  if (fund.isLoading || fundLedger.isLoading || profiles.isLoading) return <LoadingView />;
  if (fund.isError || fundLedger.isError || profiles.isError) return <ErrorView />;

  const monthRows = (fundLedger.data ?? []).filter((e) => e.occurred_at >= period && e.occurred_at < end);
  const contributions = monthRows.filter((e) => e.amount_fils > 0);
  const expenses = monthRows.filter((e) => e.amount_fils < 0);
  const totalIn = contributions.reduce((s, e) => s + e.amount_fils, 0);
  const totalOut = expenses.reduce((s, e) => s + Math.abs(e.amount_fils), 0);
  const net = totalIn - totalOut;

  const expectedFils = (profiles.data ?? []).reduce((s, p) => s + p.monthly_commitment_fils, 0);
  const collectedFils = (commitments.data ?? []).reduce((s, c) => s + c.paid_fils, 0);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.eyebrow}>{strings.fund.eyebrow}</Text>
          <View style={styles.balanceRow}>
            <MoneyText style={styles.balance}>{formatJod(fund.data ?? 0)}</MoneyText>
            <Text style={styles.currency}>{strings.common.currency}</Text>
          </View>
          <Text style={styles.subtitle}>{strings.fund.subtitle}</Text>

          <View style={styles.subTabs}>
            <TouchableOpacity style={[styles.subTab, tab === 'activity' && styles.subTabOn]} onPress={() => setTab('activity')}>
              <Text style={[styles.subTabLabel, tab === 'activity' && styles.subTabLabelOn]}>{strings.fund.tabActivity}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subTab, tab === 'report' && styles.subTabOn]} onPress={() => setTab('report')}>
              <Text style={[styles.subTabLabel, tab === 'report' && styles.subTabLabelOn]}>{strings.fund.tabReport}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {tab === 'activity' ? (
            <Card>
              {fundLedger.data && fundLedger.data.length > 0 ? (
                [...fundLedger.data].reverse().map((entry, i) => (
                  <LedgerRow
                    key={entry.id}
                    entry={{ id: entry.id, description: describeLedgerEntry(entry), occurredAt: entry.occurred_at, amountFils: entry.amount_fils }}
                    showDot
                    bordered={i < fundLedger.data.length - 1}
                  />
                ))
              ) : (
                <Text style={styles.empty}>{strings.fund.emptyActivity}</Text>
              )}
            </Card>
          ) : (
            <View style={{ gap: 12 }}>
              <Card>
                <Text style={styles.sectionLabel}>{strings.fund.reportSummaryLabel(formatPeriodLabel(period))}</Text>
                <View style={{ gap: 10 }}>
                  <View style={[styles.statRow, styles.statSuccess]}>
                    <MoneyText style={[styles.statValue, { color: colors.success }]}>+{formatJod(totalIn)} JOD</MoneyText>
                    <Text style={styles.statLabel}>{strings.fund.totalContributions}</Text>
                  </View>
                  <View style={[styles.statRow, styles.statDanger]}>
                    <MoneyText style={[styles.statValue, { color: colors.danger }]}>−{formatJod(totalOut)} JOD</MoneyText>
                    <Text style={styles.statLabel}>{strings.fund.totalExpenses}</Text>
                  </View>
                  <View style={[styles.statRow, net >= 0 ? styles.statNetPositive : styles.statDanger]}>
                    <MoneyText style={[styles.statValueLarge, { color: net >= 0 ? colors.success : colors.danger }]}>
                      {net >= 0 ? '+' : '−'}
                      {formatJod(Math.abs(net))} JOD
                    </MoneyText>
                    <Text style={styles.statLabel}>{strings.fund.netChange}</Text>
                  </View>
                </View>
              </Card>

              <Card>
                <Text style={styles.sectionLabel}>{strings.fund.monthlyContributionsLabel}</Text>
                {(profiles.data ?? []).map((p, i) => {
                  const c = commitments.data?.find((x) => x.profile_id === p.id);
                  const paid = c ? c.paid_fils >= c.required_fils : false;
                  return (
                    <View key={p.id} style={[styles.memberRow, i < (profiles.data?.length ?? 0) - 1 && styles.memberRowBorder]}>
                      <Text style={styles.memberName}>{p.display_name}</Text>
                      <View style={styles.memberTrailing}>
                        <View style={[styles.statusPill, paid ? styles.statusPillOk : styles.statusPillBad]}>
                          <Text style={[styles.statusPillText, { color: paid ? colors.success : colors.danger }]}>
                            {paid ? strings.home.paid : strings.home.unpaid}
                          </Text>
                        </View>
                        <MoneyText style={[styles.memberAmount, { color: paid ? colors.success : colors.danger }]}>
                          {formatJod(c?.paid_fils ?? 0)}/{formatJod(c?.required_fils ?? p.monthly_commitment_fils)} JOD
                        </MoneyText>
                      </View>
                    </View>
                  );
                })}
              </Card>

              <Card style={styles.expectedStrip}>
                <Text style={styles.expectedLabel}>{strings.fund.expectedTotal}</Text>
                <MoneyText style={styles.expectedValue}>
                  {formatJod(collectedFils)}/{formatJod(expectedFils)} JOD
                </MoneyText>
              </Card>
            </View>
          )}
        </View>
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
  },
  eyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.gold,
    opacity: 0.9,
    marginBottom: 8,
    textAlign: isRTL() ? 'right' : 'left',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 6,
  },
  balance: {
    fontSize: 42,
    color: colors.ink,
    lineHeight: 53,
  },
  currency: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.muted,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 24,
    textAlign: isRTL() ? 'right' : 'left',
  },
  subTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  subTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTabOn: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  subTabLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
  },
  subTabLabelOn: {
    color: '#000',
  },
  body: {
    paddingHorizontal: 20,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 30,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 16,
    textAlign: isRTL() ? 'right' : 'left',
  },
  statRow: {
    padding: 16,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSuccess: {
    backgroundColor: colors.successDim,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.18)',
  },
  statDanger: {
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.18)',
  },
  statNetPositive: {
    backgroundColor: 'rgba(52,211,153,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.12)',
  },
  statValue: {
    fontSize: 20,
    lineHeight: 25,
  },
  statValueLarge: {
    fontSize: 22,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  memberRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  memberTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAmount: {
    fontSize: 15,
    lineHeight: 19,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
  },
  statusPillOk: {
    backgroundColor: colors.successDim,
  },
  statusPillBad: {
    backgroundColor: colors.dangerDim,
  },
  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  expectedStrip: {
    padding: 18,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expectedLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  expectedValue: {
    fontSize: 16,
    color: colors.ink,
    lineHeight: 20,
  },
  });
}
