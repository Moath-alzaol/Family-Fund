import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { colors, fonts, radii } from '@/ui/theme';

type Status = 'pending' | 'approved' | 'rejected';

const APPEARANCE: Record<Status, { bg: string; fg: string }> = {
  pending: { bg: colors.warningDim, fg: colors.warning },
  approved: { bg: colors.successDim, fg: colors.success },
  rejected: { bg: colors.dangerDim, fg: colors.danger },
};

export function StatusBadge({ status }: { status: Status }) {
  const appearance = APPEARANCE[status];
  return (
    <View style={[styles.badge, { backgroundColor: appearance.bg }]}>
      <Text style={[styles.label, { color: appearance.fg }]}>{strings.status[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
});
