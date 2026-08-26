import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { localizeError } from '@/domain/errors';
import { formatJod, jodToFils } from '@/domain/money';
import { currentPeriod } from '@/domain/period';
import type { RequestType } from '@/domain/types';
import { validateRequestAmount } from '@/domain/validation';
import { useAppSettings } from '@/hooks/use-admin-actions';
import { useFundBalance, usePersonalBalances } from '@/hooks/use-balances';
import { useCommitments } from '@/hooks/use-commitments';
import { useMyProfile, useProfiles } from '@/hooks/use-profiles';
import { useCreateRequest } from '@/hooks/use-request-actions';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { AlertBanner } from '@/ui/alert-banner';
import { CheckIcon } from '@/ui/icons';
import { KeyboardAvoidingScreen } from '@/ui/keyboard-screen';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

const TYPE_ORDER: RequestType[] = ['deposit', 'withdrawal', 'contribution', 'expense'];
const TYPE_COLOR: Record<RequestType, string> = {
  deposit: colors.success,
  withdrawal: colors.danger,
  contribution: colors.warning,
  expense: colors.purple,
};

export default function NewRequestScreen() {
  const router = useRouter();
  const period = currentPeriod();
  const myProfile = useMyProfile();
  const profiles = useProfiles();
  const balances = usePersonalBalances();
  const fund = useFundBalance();
  const commitments = useCommitments(period);
  const appSettings = useAppSettings();
  const createRequest = useCreateRequest();

  const [type, setType] = useState<RequestType | null>(null);
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ direct: boolean } | null>(null);
  const styles = useMemo(() => createStyles(), []);

  const admin = profiles.data?.find((p) => p.role === 'admin');
  const isAdmin = myProfile.data?.role === 'admin';
  const myBalanceFils = balances.data?.find((b) => b.profile_id === myProfile.data?.id)?.balance_fils ?? 0;
  const fundFils = fund.data ?? 0;
  const myCommitment = commitments.data?.find((c) => c.profile_id === myProfile.data?.id);
  const dueFils = myCommitment ? myCommitment.required_fils - myCommitment.paid_fils : 0;

  useEffect(() => {
    if (type === 'contribution') setAmountText(String(dueFils / 1000));
  }, [type, dueFils]);

  const onSelectType = (t: RequestType) => {
    setType(t);
    if (t !== 'contribution') setAmountText('');
  };

  const amountFils = type === 'contribution' ? dueFils : jodToFils(Number(amountText) || 0);

  const liveError = useMemo(() => {
    if (!type) return null;
    if (type !== 'contribution' && !amountText) return null;
    return validateRequestAmount(type, amountFils, myBalanceFils, fundFils, { dueFils });
  }, [type, amountText, amountFils, myBalanceFils, fundFils, dueFils]);

  const isDirect =
    !!type && isAdmin && (type === 'withdrawal' || (type === 'deposit' && appSettings.data?.admin_deposit_requires_approval === false));

  const onSubmit = async () => {
    setError(null);
    if (!type) {
      setError(strings.createRequest.validationTypeRequired);
      return;
    }
    if (amountFils <= 0) {
      setError(strings.createRequest.validationAmountRequired);
      return;
    }
    if (!reason.trim()) {
      setError(strings.createRequest.validationNoteRequired);
      return;
    }
    if (type === 'expense' && !beneficiary.trim()) {
      setError(strings.createRequest.validationBeneficiaryRequired);
      return;
    }
    try {
      await createRequest.mutateAsync({
        type,
        amountFils,
        reason: reason.trim(),
        beneficiary: type === 'expense' ? beneficiary.trim() : undefined,
        period: type === 'contribution' ? period : undefined,
      });
      setDone({ direct: isDirect });
      setTimeout(() => router.back(), 1600);
    } catch (e) {
      setError(localizeError(e));
    }
  };

  if (done) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={strings.createRequest.title} />
        <View style={styles.successWrap}>
          <View style={styles.successIconCircle}>
            <CheckIcon size={40} color={colors.success} strokeWidth={2.5} />
          </View>
          <Text style={styles.successTitle}>{strings.createRequest.successTitle}</Text>
          <Text style={styles.successSubtitle}>
            {done.direct ? strings.createRequest.successDirectSubtitle : strings.createRequest.successPendingSubtitle(admin?.display_name ?? '')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.createRequest.title} />
      <KeyboardAvoidingScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{strings.createRequest.typeLabel}</Text>
        <View style={{ gap: 10 }}>
          {TYPE_ORDER.map((t) => {
            const isActive = type === t;
            const color = TYPE_COLOR[t];
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, isActive ? { backgroundColor: `${color}18`, borderColor: color } : styles.typeOptionOff]}
                onPress={() => onSelectType(t)}
              >
                <View style={[styles.typeIconBox, isActive ? { backgroundColor: color } : styles.typeIconBoxOff]}>
                  <Text style={[styles.typeGlyph, { color: isActive ? (t === 'contribution' ? '#000' : '#fff') : colors.muted }]}>
                    {strings.requestTypes[t].glyph}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, isActive && { fontFamily: fonts.bold }]}>{strings.requestTypes[t].label}</Text>
                  <Text style={styles.typeDescription}>{strings.requestTypes[t].description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {type && (
          <>
            {type === 'withdrawal' && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>{strings.createRequest.availableBalanceHint(formatJod(myBalanceFils))}</Text>
              </View>
            )}
            {type === 'contribution' && (
              <View style={[styles.hintBox, myBalanceFils < dueFils && styles.hintBoxDanger]}>
                <Text style={[styles.hintText, myBalanceFils < dueFils && styles.hintTextDanger]}>
                  {strings.createRequest.commitmentHint(formatJod(myBalanceFils), formatJod(dueFils))}
                  {myBalanceFils < dueFils ? ` — ${strings.createRequest.commitmentWarning}` : ''}
                </Text>
              </View>
            )}
            {type === 'expense' && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>{strings.createRequest.fundBalanceHint(formatJod(fundFils))}</Text>
              </View>
            )}

            <Text style={styles.label}>{strings.createRequest.amountLabel}</Text>
            <View style={styles.amountInputWrap}>
              <TextInput
                style={styles.amountInput}
                value={type === 'contribution' ? String(dueFils / 1000) : amountText}
                editable={type !== 'contribution'}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
                selectTextOnFocus
              />
              <Text style={styles.amountUnit}>{strings.common.currency}</Text>
            </View>

            {type === 'expense' && (
              <>
                <Text style={styles.label}>{strings.createRequest.beneficiaryLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={beneficiary}
                  onChangeText={setBeneficiary}
                  placeholder={strings.createRequest.beneficiaryPlaceholder}
                  placeholderTextColor={colors.muted}
                />
              </>
            )}

            <Text style={styles.label}>{strings.createRequest.noteLabel}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={reason}
              onChangeText={setReason}
              placeholder={strings.createRequest.notePlaceholder}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            {(liveError || error) && <AlertBanner tone="bad" text={error ?? liveError ?? ''} />}

            <TouchableOpacity onPress={onSubmit} disabled={!!liveError || createRequest.isPending} style={(!!liveError || createRequest.isPending) && styles.submitDisabled}>
              <LinearGradient colors={[colors.gold, '#7A5810']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.submitButton}>
                <Text style={styles.submitLabel}>{isDirect ? strings.createRequest.submitDirectButton : strings.createRequest.submitButton}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {isDirect && <Text style={styles.directNote}>{strings.createRequest.directNote}</Text>}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingScreen>
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
    gap: 20,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
    textAlign: isRTL() ? 'right' : 'left',
  },
  typeOption: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  typeOptionOff: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  typeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconBoxOff: {
    backgroundColor: colors.surface2,
  },
  typeGlyph: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  typeLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 4,
    textAlign: isRTL() ? 'right' : 'left',
  },
  typeDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: isRTL() ? 'right' : 'left',
  },
  hintBox: {
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    marginTop: -8,
  },
  hintBoxDanger: {
    backgroundColor: colors.dangerDim,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gold,
    textAlign: isRTL() ? 'right' : 'left',
  },
  hintTextDanger: {
    color: colors.danger,
  },
  amountInputWrap: {
    position: 'relative',
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 18,
    paddingLeft: isRTL() ? 18 : 72,
    paddingRight: isRTL() ? 72 : 18,
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    textAlign: isRTL() ? 'right' : 'left',
  },
  amountUnit: {
    position: 'absolute',
    left: isRTL() ? undefined : 20,
    right: isRTL() ? 20 : undefined,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    fontFamily: fonts.regular,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
  },
  textarea: {
    height: 90,
    textAlignVertical: 'top',
    lineHeight: 21,
  },
  submitButton: {
    borderRadius: radii.lg,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  directNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: -8,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.ink,
  },
  successSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  });
}
