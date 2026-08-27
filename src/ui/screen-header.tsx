import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isRTL } from '@/i18n/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@/ui/icons';
import { colors, fonts } from '@/ui/theme';

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const rtl = isRTL();
  const styles = useMemo(() => createStyles(), []);
  const BackChevron = rtl ? ChevronRightIcon : ChevronLeftIcon;

  return (
    <View style={[styles.row, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack ?? (() => router.back())}>
        <BackChevron size={20} color={colors.ink} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
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
      gap: 16,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    backButton: {
      padding: 9,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontFamily: fonts.extraBold,
      fontSize: 22,
      color: colors.ink,
      textAlign: isRTL() ? 'right' : 'left',
      writingDirection: isRTL() ? 'rtl' : 'ltr',
    },
  });
}
