import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatJod } from '@/domain/money';
import { currentPeriod } from '@/domain/period';
import { usePersonalBalances } from '@/hooks/use-balances';
import { useCommitments } from '@/hooks/use-commitments';
import { useMyProfile, useProfiles } from '@/hooks/use-profiles';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Avatar } from '@/ui/avatar';
import { PersonPlusIcon } from '@/ui/icons';
import { MoneyText } from '@/ui/money-text';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

export default function MembersScreen() {
  const router = useRouter();
  const myProfile = useMyProfile();
  const profiles = useProfiles();
  const balances = usePersonalBalances();
  const commitments = useCommitments(currentPeriod());
  const styles = useMemo(() => createStyles(), []);

  if (myProfile.isLoading || profiles.isLoading || balances.isLoading) return <LoadingView />;
  if (myProfile.isError || profiles.isError || balances.isError) return <ErrorView />;

  const isAdmin = myProfile.data?.role === 'admin';
  const balanceOf = (id: string) => balances.data?.find((b) => b.profile_id === id)?.balance_fils ?? 0;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.members.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{strings.members.subtitle(profiles.data?.length ?? 0)}</Text>

        {(profiles.data ?? []).map((p) => {
          const isMe = p.id === myProfile.data?.id;
          const c = commitments.data?.find((x) => x.profile_id === p.id);
          const paid = c ? c.paid_fils >= c.required_fils : false;
          const required = c?.required_fils ?? p.monthly_commitment_fils;
          const paidFils = c?.paid_fils ?? 0;

          return (
            <View key={p.id} style={[styles.card, isMe ? styles.cardMe : styles.cardOther]}>
              <View style={styles.topRow}>
                <View>
                  <Avatar name={p.display_name} id={p.id} size={58} radius={19} fontSize={25} />
                  {isMe && <View style={styles.meDot} />}
                </View>
                <View style={styles.nameBlock}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{p.display_name}</Text>
                    <View style={[styles.rolePill, p.role === 'admin' ? styles.rolePillAdmin : styles.rolePillMember]}>
                      <Text style={[styles.rolePillText, { color: p.role === 'admin' ? colors.gold : colors.muted }]}>
                        {p.role === 'admin' ? strings.role.admin : strings.role.member}
                      </Text>
                    </View>
                    {isMe && <Text style={styles.youSuffix}>{strings.members.youSuffix}</Text>}
                  </View>
                  <Text style={styles.commitmentLine}>{strings.members.monthlyCommitmentLabel(formatJod(p.monthly_commitment_fils))}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statBox, styles.statBoxNeutral]}>
                  <Text style={styles.statLabel}>{strings.members.personalBalanceLabel}</Text>
                  <MoneyText style={styles.statValue}>{formatJod(balanceOf(p.id))}</MoneyText>
                  <Text style={styles.statUnit}>{strings.common.currency}</Text>
                </View>
                <View style={[styles.statBox, paid ? styles.statBoxOk : styles.statBoxBad]}>
                  <Text style={styles.statLabel}>{strings.members.thisMonthLabel}</Text>
                  <MoneyText style={[styles.statValueSmall, { color: paid ? colors.success : colors.danger }]}>
                    {formatJod(paidFils)}/{formatJod(required)}
                  </MoneyText>
                  <Text style={[styles.statStatus, { color: paid ? colors.success : colors.danger }]}>
                    {paid ? strings.home.paid : strings.home.unpaid}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-member')}>
            <PersonPlusIcon size={18} color={colors.muted} />
            <Text style={styles.addButtonText}>{strings.members.addMemberButton}</Text>
          </TouchableOpacity>
        )}
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
      paddingBottom: 40,
      gap: 12,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.muted,
      marginBottom: 4,
      textAlign: isRTL() ? 'right' : 'left',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.xxl,
      padding: 20,
      borderWidth: 1,
    },
    cardOther: {
      borderColor: colors.border,
    },
    cardMe: {
      borderColor: 'rgba(201,168,76,0.5)',
    },
    topRow: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      gap: 16,
      marginBottom: 18,
    },
    meDot: {
      position: 'absolute',
      bottom: -3,
      left: -3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.gold,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    nameBlock: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 5,
    },
    name: {
      fontFamily: fonts.extraBold,
      fontSize: 19,
      color: colors.ink,
    },
    rolePill: {
      paddingVertical: 2,
      paddingHorizontal: 9,
      borderRadius: radii.pill,
    },
    rolePillAdmin: {
      backgroundColor: colors.goldDim,
    },
    rolePillMember: {
      backgroundColor: colors.surface2,
    },
    rolePillText: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
    },
    youSuffix: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: colors.muted,
    },
    commitmentLine: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.muted,
      textAlign: isRTL() ? 'right' : 'left',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    statBox: {
      flex: 1,
      padding: 14,
      borderRadius: radii.lg,
      borderWidth: 1,
    },
    statBoxNeutral: {
      backgroundColor: colors.surface2,
      borderColor: colors.border,
    },
    statBoxOk: {
      backgroundColor: colors.successDim,
      borderColor: 'rgba(52,211,153,0.2)',
    },
    statBoxBad: {
      backgroundColor: colors.dangerDim,
      borderColor: 'rgba(248,113,113,0.2)',
    },
    statLabel: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: colors.muted,
      marginBottom: 5,
    },
    statValue: {
      fontSize: 20,
      color: colors.ink,
      lineHeight: 25,
    },
    statValueSmall: {
      fontSize: 18,
      lineHeight: 23,
    },
    statUnit: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: colors.muted,
      marginTop: 3,
    },
    statStatus: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      marginTop: 3,
    },
    addButton: {
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: radii.xxl,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 4,
    },
    addButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: colors.muted,
    },
  });
}
