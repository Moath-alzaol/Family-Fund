import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatJod } from '@/domain/money';
import { intlLocaleTag, isRTL } from '@/i18n/locale';
import { colors, fonts } from '@/ui/theme';
import { MoneyText } from '@/ui/money-text';

export interface LedgerRowData {
  id: string;
  description: string;
  occurredAt: string;
  amountFils: number;
}

export function LedgerRow({ entry, showDot = false, bordered = true }: { entry: LedgerRowData; showDot?: boolean; bordered?: boolean }) {
  const styles = useMemo(() => createStyles(), []);
  const isCredit = entry.amountFils > 0;
  const date = new Intl.DateTimeFormat(intlLocaleTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(entry.occurredAt)
  );

  return (
    <View style={[styles.row, bordered && styles.rowBorder]}>
      {showDot && <View style={[styles.dot, { backgroundColor: isCredit ? colors.success : colors.danger }]} />}
      <View style={styles.textBlock}>
        <Text style={styles.description} numberOfLines={1}>
          {entry.description}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <MoneyText style={[styles.amount, { color: isCredit ? colors.success : colors.danger }]}>
        {isCredit ? '+' : '−'}
        {formatJod(Math.abs(entry.amountFils))}
      </MoneyText>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
  row: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  amount: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  textBlock: {
    flex: 1,
    alignItems: isRTL() ? 'flex-end' : 'flex-start',
  },
  description: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  });
}
