import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatJod } from '@/domain/money';
import { currentPeriod } from '@/domain/period';
import { useFundBalance, usePersonalBalances } from '@/hooks/use-balances';
import { useCommitments } from '@/hooks/use-commitments';
import { useMyProfile, useProfiles } from '@/hooks/use-profiles';
import { useRequests } from '@/hooks/use-requests';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Avatar } from '@/ui/avatar';
import { Card } from '@/ui/card';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, CrossIcon } from '@/ui/icons';
import { MoneyText } from '@/ui/money-text';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { colors, fonts } from '@/ui/theme';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? strings.greeting.morning : strings.greeting.evening;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const period = currentPeriod();
  const myProfile = useMyProfile();
  const profiles = useProfiles();
  const balances = usePersonalBalances();
  const fund = useFundBalance();
  const commitments = useCommitments(period);
  const pendingRequests = useRequests('pending');
  const styles = useMemo(() => createStyles(), []);

  if (myProfile.isLoading || profiles.isLoading || balances.isLoading || fund.isLoading) return <LoadingView />;
  if (myProfile.isError || profiles.isError || balances.isError || fund.isError) return <ErrorView />;
  if (!myProfile.data) return null;

  const balanceOf = (profileId: string) => balances.data?.find((b) => b.profile_id === profileId)?.balance_fils ?? 0;
  const commitmentOf = (profileId: string) => commitments.data?.find((c) => c.profile_id === profileId);

  const expectedFils = (profiles.data ?? []).reduce((sum, p) => sum + p.monthly_commitment_fils, 0);
  const collectedFils = (commitments.data ?? []).reduce((sum, c) => sum + c.paid_fils, 0);
  const remainingFils = expectedFils - collectedFils;
  const progressPct = expectedFils > 0 ? Math.round((collectedFils / expectedFils) * 100) : 0;

  const unpaidMembers = (profiles.data ?? []).filter((p) => {
    const c = commitmentOf(p.id);
    return c ? c.paid_fils < c.required_fils : p.monthly_commitment_fils > 0;
  });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{myProfile.data.display_name}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.fundCard}>
            <View style={[styles.fundCircle, styles.fundCircleTop]} />
            <View style={[styles.fundCircle, styles.fundCircleBottom]} />
            <Text style={styles.fundLabel}>{strings.home.fundCardLabel}</Text>
            <View style={styles.fundAmountRow}>
              <MoneyText style={styles.fundAmount}>{formatJod(fund.data ?? 0)}</MoneyText>
              <Text style={styles.fundCurrency}>{strings.common.currency}</Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressMuted}>{strings.home.collectedThisMonth}</Text>
                <MoneyText style={styles.progressValue}>
                  {formatJod(collectedFils)} / {formatJod(expectedFils)} JOD
                </MoneyText>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={isRTL() ? [colors.goldLight, colors.gold] : [colors.gold, colors.goldLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.min(100, progressPct)}%` }]}
                />
              </View>
              {remainingFils > 0 && (
                <Text style={styles.progressWarning}>{strings.home.remainingToComplete(formatJod(remainingFils))}</Text>
              )}
            </View>
          </View>

          <Card>
            <Text style={styles.sectionLabel}>{strings.home.commitmentsLabel}</Text>
            <View style={styles.commitmentsRow}>
              {(profiles.data ?? []).map((p) => {
                const c = commitmentOf(p.id);
                const paid = c ? c.paid_fils >= c.required_fils : false;
                const due = c ? c.required_fils - c.paid_fils : p.monthly_commitment_fils;
                return (
                  <View key={p.id} style={styles.commitmentItem}>
                    <View>
                      <Avatar name={p.display_name} id={p.id} size={50} radius={15} fontSize={20} />
                      <View style={[styles.statusDot, { backgroundColor: paid ? colors.success : colors.danger }]}>
                        {paid ? <CheckIcon size={10} /> : <CrossIcon size={10} />}
                      </View>
                    </View>
                    <Text style={styles.commitmentName}>{p.display_name}</Text>
                    <Text style={[styles.commitmentStatus, { color: paid ? colors.success : colors.danger }]}>
                      {paid ? strings.home.paid : strings.home.remaining(formatJod(due))}
                    </Text>
                  </View>
                );
              })}
            </View>

            {unpaidMembers.map((p) => {
              const c = commitmentOf(p.id);
              const due = c ? c.required_fils - c.paid_fils : p.monthly_commitment_fils;
              return (
                <View key={p.id} style={styles.unpaidNotice}>
                  <Text style={styles.unpaidText}>{strings.home.notPaidYet(p.display_name)}</Text>
                  <MoneyText style={styles.unpaidAmount}>{formatJod(due)} JOD</MoneyText>
                </View>
              );
            })}
          </Card>

          <TouchableOpacity style={styles.balanceButton} onPress={() => router.push('/balances')}>
            <View style={styles.balanceValueWrap}>
              <Text style={styles.balanceLabel}>{strings.home.myBalanceLabel}</Text>
              <View style={styles.balanceAmountRow}>
                <MoneyText style={styles.balanceAmount}>{formatJod(balanceOf(myProfile.data.id))}</MoneyText>
                <Text style={styles.balanceCurrency}>{strings.common.currency}</Text>
              </View>
            </View>
            <View style={styles.balanceDetailsLink}>
              <Text style={styles.balanceDetailsText}>{strings.home.detailsLink}</Text>
              {isRTL() ? (
                <ChevronLeftIcon size={14} color={colors.gold} strokeWidth={2.5} />
              ) : (
                <ChevronRightIcon size={14} color={colors.gold} strokeWidth={2.5} />
              )}
            </View>
          </TouchableOpacity>

          <View>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.pendingTitleRow}>
                <Text style={styles.pendingTitle}>{strings.home.pendingRequestsTitle}</Text>
                {pendingRequests.data && pendingRequests.data.length > 0 && (
                  <View style={styles.pendingCountBadge}>
                    <Text style={styles.pendingCountText}>{pendingRequests.data.length}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => router.push('/requests')}>
                <Text style={styles.viewAllLink}>{strings.home.viewAll}</Text>
              </TouchableOpacity>
            </View>

            {pendingRequests.data && pendingRequests.data.length > 0 ? (
              <View style={{ gap: 10 }}>
                {pendingRequests.data.map((r) => (
                  <TouchableOpacity key={r.id} style={styles.requestRow} onPress={() => router.push(`/request/${r.id}`)}>
                    <Avatar name={r.requester?.display_name ?? ''} id={r.requester_id} />
                    <View style={styles.requestTextBlock}>
                      <Text style={styles.requestTitle} numberOfLines={1}>
                        {r.requester?.display_name} · {strings.requestTypes[r.type].label}
                      </Text>
                      <Text style={styles.requestNote} numberOfLines={1}>
                        {r.reason || '—'}
                      </Text>
                    </View>
                    <View style={styles.requestAmountBlock}>
                      <MoneyText style={styles.requestAmount}>{formatJod(r.amount_fils)}</MoneyText>
                      <Text style={styles.requestCurrency}>{strings.common.currency}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <CheckIcon size={26} color={colors.success} strokeWidth={2.5} />
                </View>
                <Text style={styles.emptyTitle}>{strings.home.noPendingTitle}</Text>
                <Text style={styles.emptySubtitle}>{strings.home.noPendingSubtitle}</Text>
              </Card>
            )}
          </View>
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
    direction: 'ltr',
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 2,
    textAlign: isRTL() ? 'right' : 'left',
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
  },
  body: {
    paddingHorizontal: 20,
    gap: 14,
  },
  fundCard: {
    backgroundColor: '#0C1D3A',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.28)',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  fundCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  fundCircleTop: {
    top: -40,
    left: -40,
    width: 140,
    height: 140,
  },
  fundCircleBottom: {
    bottom: -20,
    right: 20,
    width: 90,
    height: 90,
    backgroundColor: 'rgba(201,168,76,0.04)',
  },
  fundLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.gold,
    opacity: 0.9,
    marginBottom: 10,
    textAlign: isRTL() ? 'right' : 'left',
  },
  fundAmountRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  fundAmount: {
    fontSize: 42,
    color: colors.ink,
    lineHeight: 53,
  },
  fundCurrency: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
    marginBottom: 4,
  },
  progressSection: {
    marginTop: 20,
  },
  progressLabels: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressMuted: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  progressValue: {
    fontSize: 12,
    color: colors.ink,
    lineHeight: 15,
  },
  progressTrack: {
    height: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    flexDirection: isRTL() ? 'row-reverse' : 'row',
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
  },
  progressWarning: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
    textAlign: isRTL() ? 'right' : 'left',
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 16,
    textAlign: isRTL() ? 'right' : 'left',
  },
  commitmentsRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    gap: 12,
  },
  commitmentItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  commitmentName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ink,
  },
  commitmentStatus: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  unpaidNotice: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unpaidAmount: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 16,
  },
  unpaidText: {
    fontFamily: fonts.regular,
    color: colors.danger,
    fontSize: 13,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  balanceButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 20,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceDetailsLink: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceDetailsText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.gold,
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  balanceValueWrap: {
    alignItems: isRTL() ? 'flex-end' : 'flex-start',
  },
  balanceLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  balanceAmountRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  balanceAmount: {
    fontSize: 26,
    color: colors.ink,
    lineHeight: 33,
  },
  balanceCurrency: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 1,
  },
  sectionHeaderRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.gold,
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  pendingTitleRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  pendingCountBadge: {
    backgroundColor: colors.warning,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  pendingCountText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#000',
  },
  requestRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestTextBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: isRTL() ? 'flex-end' : 'flex-start',
  },
  requestTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 4,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  requestNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  requestAmountBlock: {
    alignItems: isRTL() ? 'flex-start' : 'flex-end',
  },
  requestAmount: {
    fontSize: 16,
    color: colors.warning,
    lineHeight: 20,
  },
  requestCurrency: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  emptyCard: {
    padding: 36,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.successDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 6,
    textAlign: 'center',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  });
}
