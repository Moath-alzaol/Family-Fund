import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { isRTL } from '@/i18n/locale';
import { colors, fonts } from '@/ui/theme';

export function KeyValueRow({ label, children }: { label: string; children: ReactNode }) {
  const styles = useMemo(() => createStyles(), []);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={styles.value}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

// isRTL() must be read inside this factory (called at render time), not at
// module scope — StyleSheet.create only runs once, on first import, which
// happens before the app finishes loading the saved language preference.
function createStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      fontFamily: fonts.regular,
      fontSize: 12.5,
      color: colors.muted,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    value: {
      fontFamily: fonts.semiBold,
      fontSize: 13.5,
      color: colors.ink,
      textAlign: isRTL() ? 'left' : 'right',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
  });
}
