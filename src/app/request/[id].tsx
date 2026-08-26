import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { localizeError } from '@/domain/errors';
import { formatJod } from '@/domain/money';
import { validateRequestAmount } from '@/domain/validation';
import { useFundBalance, usePersonalBalances } from '@/hooks/use-balances';
import { useCommitments } from '@/hooks/use-commitments';
import { useMyProfile, useProfiles } from '@/hooks/use-profiles';
import { useRequest } from '@/hooks/use-request';
import { useApproveRequest, useRejectRequest } from '@/hooks/use-request-actions';
import { intlLocaleTag, isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { Avatar } from '@/ui/avatar';
import { Card } from '@/ui/card';
import { KeyboardAvoidingScreen } from '@/ui/keyboard-screen';
import { MoneyText } from '@/ui/money-text';
import { notify } from '@/ui/notify';
import { ErrorView, LoadingView } from '@/ui/query-state';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

function affectsText(type: string): string {
  switch (type) {
    case 'deposit':
      return strings.requestDetail.affectsPersonalUp;
    case 'withdrawal':
      return strings.requestDetail.affectsPersonalDown;
    case 'contribution':
      return strings.requestDetail.affectsPersonalDownFundUp;
    case 'expense':
      return strings.requestDetail.affectsFundDown;
    default:
      return '';
  }
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const request = useRequest(id);
  const myProfile = useMyProfile();
  const profiles = useProfiles();
  const admin = profiles.data?.find((p) => p.role === 'admin');
  const balances = usePersonalBalances();
  const fund = useFundBalance();
  const commitments = useCommitments(request.data?.period ?? '');
  const approve = useApproveRequest();
  const reject = useRejectRequest();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = myProfile.data?.role === 'admin';
  const styles = useMemo(() => createStyles(), []);

  const guard = useMemo(() => {
    if (!request.data || request.data.status !== 'pending') return null;
    const balanceFils = balances.data?.find((b) => b.profile_id === request.data.requester_id)?.balance_fils ?? 0;
    const fundFils = fund.data ?? 0;
    const commitment = commitments.data?.find((c) => c.profile_id === request.data.requester_id);
    const dueFils = commitment ? commitment.required_fils - commitment.paid_fils : 0;
    return validateRequestAmount(request.data.type, request.data.amount_fils, balanceFils, fundFils, { dueFils });
  }, [request.data, balances.data, fund.data, commitments.data]);

  if (request.isLoading) return <LoadingView />;
  if (request.isError || !request.data) return <ErrorView />;

  const r = request.data;
  const date = new Intl.DateTimeFormat(intlLocaleTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(r.created_at));
  const decidedDate = r.decided_at
    ? new Intl.DateTimeFormat(intlLocaleTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(r.decided_at))
    : null;

  const statusTone = r.status === 'pending' ? 'warning' : r.status === 'approved' ? 'success' : 'danger';
  const statusText =
    r.status === 'pending'
      ? strings.requestDetail.statusPendingText(admin?.display_name ?? '')
      : r.status === 'approved'
        ? strings.requestDetail.statusApprovedText(r.decider?.display_name ?? '')
        : strings.requestDetail.statusRejectedText(r.decider?.display_name ?? '');

  const onApprove = async () => {
    setActionError(null);
    try {
      await approve.mutateAsync(r.id);
      notify(strings.requestDetail.approveSuccess);
      router.back();
    } catch (error) {
      setActionError(localizeError(error));
    }
  };

  const onReject = async () => {
    if (!reason.trim()) {
      setReasonTouched(true);
      return;
    }
    setActionError(null);
    try {
      await reject.mutateAsync({ requestId: r.id, reason: reason.trim() });
      setRejecting(false);
      notify(strings.rejectModal.success);
      router.back();
    } catch (error) {
      setActionError(localizeError(error));
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.requestDetail.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusBanner, { backgroundColor: TONE[statusTone].bg, borderColor: TONE[statusTone].border }]}>
          <Text style={[styles.statusBannerText, { color: TONE[statusTone].fg }]}>{statusText}</Text>
          <Text style={[styles.statusBannerLabel, { color: TONE[statusTone].fg }]}>{strings.status[r.status]}</Text>
        </View>

        <Card>
          <View style={styles.requesterRow}>
            <Avatar name={r.requester?.display_name ?? ''} id={r.requester_id} size={58} radius={18} fontSize={25} />
            <View>
              <Text style={styles.mutedLabel}>{strings.requestDetail.requestFromLabel}</Text>
              <Text style={styles.requesterName}>{r.requester?.display_name}</Text>
            </View>
          </View>
          <View style={styles.divider}>
            <Text style={styles.mutedLabel}>{strings.requestDetail.typeLabel}</Text>
            <Text style={styles.typeName}>{strings.requestTypes[r.type].label}</Text>
            <Text style={styles.typeDescription}>{strings.requestTypes[r.type].description}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.mutedLabel}>{strings.requestDetail.amountLabel}</Text>
          <View style={styles.amountRow}>
            <MoneyText style={styles.amountValue}>{formatJod(r.amount_fils)}</MoneyText>
            <Text style={styles.amountUnit}>{strings.common.currency}</Text>
          </View>
          <Text style={styles.affectsText}>{strings.requestDetail.affectsLabel(affectsText(r.type))}</Text>
          {r.beneficiary && <Text style={styles.beneficiaryText}>{strings.requestDetail.beneficiaryLabel(r.beneficiary)}</Text>}
        </Card>

        <Card>
          <Text style={styles.mutedLabel}>{strings.requestDetail.noteLabel}</Text>
          <Text style={styles.noteText}>{r.reason || '—'}</Text>
          <View style={styles.datesBlock}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>{strings.requestDetail.requestDateLabel}</Text>
              <Text style={styles.dateValue}>{date}</Text>
            </View>
            {decidedDate && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  {r.status === 'approved' ? strings.requestDetail.approvedDateLabel : strings.requestDetail.rejectedDateLabel}
                </Text>
                <Text style={styles.dateValue}>{decidedDate}</Text>
              </View>
            )}
          </View>
        </Card>

        {r.status === 'rejected' && r.rejection_reason && (
          <View style={styles.rejectionBlock}>
            <Text style={styles.rejectionTitle}>{strings.requestDetail.rejectionReasonLabel}</Text>
            <Text style={styles.rejectionText}>{r.rejection_reason}</Text>
            <View style={styles.rejectionDivider}>
              <Text style={styles.rejectionNote}>{strings.requestDetail.noAmountDeducted}</Text>
            </View>
          </View>
        )}

        {guard && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.guardText}>{guard + strings.requestDetail.guardSuffix}</Text>
          </View>
        )}
        {actionError && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.guardText}>{actionError}</Text>
          </View>
        )}

        {r.status === 'pending' && isAdmin && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.rejectButton} onPress={() => setRejecting(true)}>
              <Text style={styles.rejectButtonText}>{strings.requestDetail.rejectButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approveButton, (!!guard || approve.isPending) && styles.disabled]}
              disabled={!!guard || approve.isPending}
              onPress={onApprove}
            >
              <Text style={styles.approveButtonText}>{strings.requestDetail.approveButton}</Text>
            </TouchableOpacity>
          </View>
        )}

        {r.status === 'pending' && !isAdmin && (
          <View style={styles.pendingNotice}>
            <Text style={styles.pendingNoticeText}>{strings.requestDetail.pendingNotice(admin?.display_name ?? '')}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={rejecting} transparent animationType="fade" onRequestClose={() => setRejecting(false)}>
        <KeyboardAvoidingScreen>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeaderRow}>
                <TouchableOpacity onPress={() => setRejecting(false)}>
                  <Text style={styles.modalCancel}>{strings.rejectModal.cancel}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{strings.rejectModal.title}</Text>
              </View>
              <Text style={styles.modalHelper}>{strings.rejectModal.helper}</Text>
              <TextInput
                style={[styles.modalTextarea, reasonTouched && !reason.trim() && styles.modalTextareaError]}
                value={reason}
                onChangeText={(v) => {
                  setReason(v);
                  setReasonTouched(false);
                }}
                placeholder={strings.rejectModal.placeholder}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />
              {reasonTouched && !reason.trim() && <Text style={styles.modalError}>{strings.rejectModal.errorEmpty}</Text>}
              <TouchableOpacity style={[styles.confirmButton, reject.isPending && styles.disabled]} onPress={onReject} disabled={reject.isPending}>
                <Text style={styles.confirmButtonText}>{strings.rejectModal.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingScreen>
      </Modal>
    </View>
  );
}

const TONE: Record<'warning' | 'success' | 'danger', { bg: string; border: string; fg: string }> = {
  warning: { bg: colors.warningDim, border: 'rgba(251,191,36,0.25)', fg: colors.warning },
  success: { bg: colors.successDim, border: 'rgba(52,211,153,0.25)', fg: colors.success },
  danger: { bg: colors.dangerDim, border: 'rgba(248,113,113,0.25)', fg: colors.danger },
};

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
    gap: 14,
  },
  statusBanner: {
    padding: 14,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBannerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  statusBannerLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
  requesterRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  mutedLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    textAlign: isRTL() ? 'right' : 'left',
  },
  requesterName: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.ink,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },
  typeName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
    textAlign: isRTL() ? 'right' : 'left',
  },
  typeDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    textAlign: isRTL() ? 'right' : 'left',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    color: colors.ink,
    lineHeight: 50,
  },
  amountUnit: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.muted,
    marginBottom: 3,
  },
  affectsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: isRTL() ? 'right' : 'left',
  },
  beneficiaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.gold,
    marginTop: 8,
    textAlign: isRTL() ? 'right' : 'left',
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: isRTL() ? 'right' : 'left',
  },
  datesBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    gap: 14,
  },
  dateRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  dateValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  rejectionBlock: {
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  rejectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 10,
    textAlign: isRTL() ? 'right' : 'left',
  },
  rejectionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 23,
    textAlign: isRTL() ? 'right' : 'left',
  },
  rejectionDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(248,113,113,0.15)',
    marginTop: 14,
    paddingTop: 14,
  },
  rejectionNote: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.danger,
    textAlign: isRTL() ? 'right' : 'left',
  },
  guardText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.danger,
    lineHeight: 19,
    textAlign: isRTL() ? 'right' : 'left',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.danger,
  },
  approveButton: {
    flex: 2,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  approveButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#000',
  },
  disabled: {
    opacity: 0.5,
  },
  pendingNotice: {
    padding: 16,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pendingNoticeText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCancel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ink,
  },
  modalHelper: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalTextarea: {
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    height: 100,
    textAlignVertical: 'top',
    textAlign: isRTL() ? 'right' : 'left',
  },
  modalTextareaError: {
    borderColor: colors.danger,
  },
  modalError: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#fff',
  },
  });
}
