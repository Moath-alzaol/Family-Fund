import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { isRTL } from '@/i18n/locale';
import { colors, fonts, radii } from '@/ui/theme';

export function AlertBanner({ text, tone = 'gold', icon }: { text: string; tone?: 'gold' | 'bad' | 'info'; icon?: string }) {
  const styles = useMemo(() => createStyles(), []);
  const toneStyle = tone === 'bad' ? styles.bad : styles.gold;
  const textStyle = tone === 'bad' ? styles.badText : styles.goldText;
  return (
    <View style={[styles.alert, toneStyle]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
}

// isRTL() must be read inside this factory (called at render time), not at
// module scope — StyleSheet.create only runs once, on first import, which
// happens before the app finishes loading the saved language preference.
function createStyles() {
  return StyleSheet.create({
    alert: {
      borderRadius: radii.sm,
      padding: 14,
      flexDirection: isRTL() ? 'row-reverse' : 'row',
      gap: 10,
    },
    gold: {
      backgroundColor: colors.goldDim,
      borderWidth: 1,
      borderColor: 'rgba(201,168,76,0.3)',
    },
    bad: {
      backgroundColor: colors.dangerDim,
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.3)',
    },
    icon: {
      fontSize: 14,
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    text: {
      flex: 1,
      fontFamily: fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
    goldText: {
      color: colors.gold,
    },
    badText: {
      color: colors.danger,
    },
  });
}
