import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/api/supabase';
import { useAppSettings, useSetAdminDepositRequiresApproval } from '@/hooks/use-admin-actions';
import { useMyProfile } from '@/hooks/use-profiles';
import { getCurrentLocaleSync, isRTL, setLocale, type Locale } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Card } from '@/ui/card';
import { KeyValueRow } from '@/ui/key-value';
import { colors, fonts, radii } from '@/ui/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const myProfile = useMyProfile();
  const appSettings = useAppSettings();
  const setAdminDeposit = useSetAdminDepositRequiresApproval();
  const [locale, setLocaleState] = useState<Locale>(getCurrentLocaleSync());
  const isAdmin = myProfile.data?.role === 'admin';
  const styles = useMemo(() => createStyles(), []);

  const onSelectLocale = async (next: Locale) => {
    if (next === locale) return;
    setLocaleState(next);
    await setLocale(next);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>{strings.settings.title}</Text>
        </View>

        <Text style={styles.sectionLabel}>{strings.settings.language}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, locale === 'ar' && styles.langChipActive]}
            onPress={() => onSelectLocale('ar')}
          >
            <Text style={[styles.langChipText, locale === 'ar' && styles.langChipTextActive]}>
              {strings.settings.languageArabic}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, locale === 'en' && styles.langChipActive]}
            onPress={() => onSelectLocale('en')}
          >
            <Text style={[styles.langChipText, locale === 'en' && styles.langChipTextActive]}>
              {strings.settings.languageEnglish}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkGroup}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/members')}>
            <Text style={styles.linkRowText}>{strings.settings.membersLink}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/change-password')}>
            <Text style={styles.linkRowText}>{strings.settings.changePasswordLink}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{strings.settings.title}</Text>
        <Card>
          <KeyValueRow label={strings.settings.autoDeduction}>{strings.settings.autoDeductionValue}</KeyValueRow>
          <KeyValueRow label={strings.settings.partialPayment}>{strings.settings.partialPaymentValue}</KeyValueRow>
          <KeyValueRow label={strings.settings.negativeBalance}>{strings.settings.negativeBalanceValue}</KeyValueRow>
          <KeyValueRow label={strings.settings.bankLink}>{strings.settings.bankLinkValue}</KeyValueRow>
        </Card>

        {isAdmin && (
          <Card style={styles.adminCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBlock}>
                <Text style={styles.switchLabel}>{strings.settings.adminDepositLabel}</Text>
                <Text style={styles.switchHint}>{strings.settings.adminDepositHint}</Text>
              </View>
              <Switch
                value={appSettings.data?.admin_deposit_requires_approval ?? true}
                onValueChange={(value) => setAdminDeposit.mutate(value)}
                disabled={appSettings.isLoading || setAdminDeposit.isPending}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor={colors.ink}
              />
            </View>
          </Card>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>{strings.settings.logout}</Text>
        </TouchableOpacity>
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
      paddingHorizontal: 20,
      paddingBottom: 60,
    },
    header: {
      paddingBottom: 24,
    },
    title: {
      fontFamily: fonts.extraBold,
      fontSize: 24,
      color: colors.ink,
      textAlign: isRTL() ? 'right' : 'left',
    },
    sectionLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: colors.muted,
      marginTop: 20,
      marginBottom: 10,
      textAlign: isRTL() ? 'right' : 'left',
    },
    langRow: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      gap: 10,
    },
    langChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    langChipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.goldDim,
    },
    langChipText: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    langChipTextActive: {
      color: colors.gold,
    },
    linkGroup: {
      marginTop: 20,
      gap: 10,
    },
    linkRow: {
      padding: 16,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    linkRowText: {
      fontFamily: fonts.semiBold,
      fontSize: 13.5,
      color: colors.ink,
      textAlign: isRTL() ? 'right' : 'left',
    },
    adminCard: {
      marginTop: 12,
    },
    switchRow: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    switchTextBlock: {
      flex: 1,
    },
    switchLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 13.5,
      color: colors.ink,
      marginBottom: 4,
      textAlign: isRTL() ? 'right' : 'left',
    },
    switchHint: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: colors.muted,
      lineHeight: 17,
      textAlign: isRTL() ? 'right' : 'left',
    },
    logoutButton: {
      marginTop: 28,
      padding: 16,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.3)',
      backgroundColor: colors.dangerDim,
      alignItems: 'center',
    },
    logoutText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
  });
}
